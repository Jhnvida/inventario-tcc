-- Migration: 20261001_create_pedidos_venda.sql
-- Descrição: Módulo de Pedidos de Venda com integridade transacional, hierarquia de locks anti-deadlock,
--            privilégios restritos por coluna, recálculo atômico e RPCs seguras com validação de autoria.

-- 1. Criação da Tabela de Pedidos de Venda
CREATE TABLE public.pedidos_venda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero SERIAL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'concluido', 'cancelado')),
    valor_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (valor_subtotal >= 0),
    desconto NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (desconto >= 0 AND desconto <= valor_subtotal),
    valor_total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (valor_total = (valor_subtotal - desconto) AND valor_total >= 0),
    retornou_estoque BOOLEAN NULL,
    motivo_cancelamento TEXT NULL,
    observacoes TEXT NULL,
    criado_em TIMESTAMPTZ DEFAULT timezone('utc', now()),
    atualizado_em TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Criação da Tabela de Itens de Venda (Chave Estrangeira com RESTRICT para exclusão controlada)
CREATE TABLE public.itens_pedido_venda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_venda_id UUID NOT NULL REFERENCES public.pedidos_venda(id) ON DELETE RESTRICT,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(12,2) NOT NULL CHECK (preco_unitario >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal = ROUND(quantidade * preco_unitario, 2) AND subtotal >= 0),
    CONSTRAINT uq_pedido_venda_produto UNIQUE (pedido_venda_id, produto_id)
);

-- 3. Índices de Alta Performance
CREATE INDEX idx_pedidos_venda_cliente ON public.pedidos_venda(cliente_id);
CREATE INDEX idx_pedidos_venda_usuario ON public.pedidos_venda(usuario_id);
CREATE INDEX idx_pedidos_venda_status ON public.pedidos_venda(status);
CREATE INDEX idx_pedidos_venda_numero ON public.pedidos_venda(numero);
CREATE INDEX idx_pedidos_venda_criado_em ON public.pedidos_venda(criado_em DESC);
CREATE INDEX idx_itens_pedido_venda_pedido ON public.itens_pedido_venda(pedido_venda_id);
CREATE INDEX idx_itens_pedido_venda_produto ON public.itens_pedido_venda(produto_id);

-- 4. Função Privada de Recálculo Seguro dos Totais (SECURITY DEFINER, sem permissão externa)
CREATE OR REPLACE FUNCTION public.recalcular_totais_pedido_venda(p_pedido_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_subtotal NUMERIC(12,2);
    v_desconto_atual NUMERIC(12,2);
BEGIN
    -- Bloqueia o cabeçalho do pedido para garantir isolamento atômico
    SELECT COALESCE(desconto, 0) INTO v_desconto_atual
    FROM public.pedidos_venda
    WHERE id = p_pedido_id
    FOR UPDATE;

    -- Soma os subtotais exatos de todos os itens vinculados
    SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
    FROM public.itens_pedido_venda
    WHERE pedido_venda_id = p_pedido_id;

    -- Regra de Negócio: Rejeita se o desconto superar o novo subtotal
    IF v_desconto_atual > v_subtotal THEN
        RAISE EXCEPTION 'Operação rejeitada: o novo subtotal dos itens (R$ %) é inferior ao desconto aplicado no pedido (R$ %). Reduza o desconto do pedido antes de alterar estes itens.',
            TO_CHAR(v_subtotal, 'FM999G999D00'), TO_CHAR(v_desconto_atual, 'FM999G999D00');
    END IF;

    -- Atualiza os totais com privilégio elevado de SECURITY DEFINER
    UPDATE public.pedidos_venda
    SET valor_subtotal = v_subtotal,
        valor_total = v_subtotal - v_desconto_atual,
        atualizado_em = timezone('utc', now())
    WHERE id = p_pedido_id;
END;
$$;

ALTER FUNCTION public.recalcular_totais_pedido_venda(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.recalcular_totais_pedido_venda(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recalcular_totais_pedido_venda(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.recalcular_totais_pedido_venda(UUID) FROM authenticated;

-- 5. Trigger em Pedidos de Venda: Atualização Segura de Desconto e Imutabilidade do Subtotal em Rascunho
CREATE OR REPLACE FUNCTION public.handle_pedidos_venda_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.atualizado_em := timezone('utc', now());

    IF OLD.status = 'rascunho' AND NEW.status = 'rascunho' THEN
        IF NEW.desconto < 0 THEN
            RAISE EXCEPTION 'O valor do desconto não pode ser negativo.';
        END IF;

        IF NEW.desconto > NEW.valor_subtotal THEN
            RAISE EXCEPTION 'Operação rejeitada: o desconto (R$ %) não pode ser superior ao subtotal do pedido (R$ %).',
                TO_CHAR(NEW.desconto, 'FM999G999D00'), TO_CHAR(NEW.valor_subtotal, 'FM999G999D00');
        END IF;

        -- Impede adulteração direta de autoria, número e data de criação
        NEW.usuario_id := OLD.usuario_id;
        NEW.numero := OLD.numero;
        NEW.criado_em := OLD.criado_em;
        NEW.valor_total := NEW.valor_subtotal - NEW.desconto;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pedidos_venda_before_update
BEFORE UPDATE ON public.pedidos_venda
FOR EACH ROW
EXECUTE FUNCTION public.handle_pedidos_venda_before_update();

-- 6. Trigger de Imutabilidade Estrita e Allowlist de Cancelamento (Comparações Null-Safe)
CREATE OR REPLACE FUNCTION public.check_pedidos_venda_imutabilidade()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status = 'cancelado' THEN
        RAISE EXCEPTION 'Pedidos de venda cancelados são definitivos e não podem ser alterados.';
    END IF;

    IF OLD.status = 'concluido' THEN
        IF NEW.status = 'cancelado' THEN
            -- Exige a flag de autorização da RPC
            IF current_setting('app.internal_pedido_venda_transition', true) IS DISTINCT FROM 'true' THEN
                RAISE EXCEPTION 'O cancelamento de pedidos concluídos só pode ser realizado através da rotina autorizada (RPC).';
            END IF;

            -- Allowlist Estrita: Protege todos os campos comerciais, autoria e identificação
            IF NEW.id IS DISTINCT FROM OLD.id
               OR NEW.numero IS DISTINCT FROM OLD.numero
               OR NEW.cliente_id IS DISTINCT FROM OLD.cliente_id
               OR NEW.usuario_id IS DISTINCT FROM OLD.usuario_id
               OR NEW.valor_subtotal IS DISTINCT FROM OLD.valor_subtotal
               OR NEW.desconto IS DISTINCT FROM OLD.desconto
               OR NEW.valor_total IS DISTINCT FROM OLD.valor_total
               OR NEW.observacoes IS DISTINCT FROM OLD.observacoes
               OR NEW.criado_em IS DISTINCT FROM OLD.criado_em THEN
                RAISE EXCEPTION 'Adulteração detectada: não é permitido modificar dados comerciais ou autoria ao cancelar um pedido.';
            END IF;

            RETURN NEW;
        ELSE
            RAISE EXCEPTION 'Pedidos de venda concluídos não podem ser reabertos ou alterados.';
        END IF;
    END IF;

    IF OLD.status = 'rascunho' AND NEW.status IN ('concluido', 'cancelado') THEN
        IF current_setting('app.internal_pedido_venda_transition', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'A alteração de status do pedido só pode ser realizada através das rotinas controladas do sistema (RPC).';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pedidos_venda_imutabilidade
BEFORE UPDATE ON public.pedidos_venda
FOR EACH ROW
EXECUTE FUNCTION public.check_pedidos_venda_imutabilidade();

-- 7. Trigger de Bloqueio de Exclusão Direta em Pedidos Concluídos ou Cancelados
CREATE OR REPLACE FUNCTION public.check_pedidos_venda_bloqueio_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IN ('concluido', 'cancelado') THEN
        RAISE EXCEPTION 'Não é permitido excluir pedidos de venda concluídos ou cancelados. Histórico imutável.';
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_pedidos_venda_bloqueio_delete
BEFORE DELETE ON public.pedidos_venda
FOR EACH ROW
EXECUTE FUNCTION public.check_pedidos_venda_bloqueio_delete();

-- 8. Trigger de Bloqueio Prévio e Consistência de Itens (Hierarquia de Locks)
CREATE OR REPLACE FUNCTION public.check_itens_pedido_venda_before_dml()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_status VARCHAR;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Bloqueia o pedido pai e verifica se está em rascunho
        SELECT status INTO v_status 
        FROM public.pedidos_venda 
        WHERE id = NEW.pedido_venda_id 
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Pedido de venda não encontrado.';
        END IF;

        IF v_status IS DISTINCT FROM 'rascunho' THEN
            RAISE EXCEPTION 'Não é permitido adicionar itens a pedidos de venda concluídos ou cancelados.';
        END IF;

        NEW.subtotal := ROUND(NEW.quantidade * NEW.preco_unitario, 2);
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Bloqueia o pedido pai e verifica se está em rascunho
        SELECT status INTO v_status 
        FROM public.pedidos_venda 
        WHERE id = OLD.pedido_venda_id 
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Pedido de venda não encontrado.';
        END IF;

        IF v_status IS DISTINCT FROM 'rascunho' THEN
            RAISE EXCEPTION 'Não é permitido remover itens de pedidos de venda já concluídos ou cancelados.';
        END IF;

        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.pedido_venda_id IS DISTINCT FROM NEW.pedido_venda_id THEN
            -- Bloqueio determinístico ordenado por UUID para evitar deadlock entre cabeçalhos
            PERFORM id 
            FROM public.pedidos_venda 
            WHERE id IN (OLD.pedido_venda_id, NEW.pedido_venda_id)
            ORDER BY id ASC 
            FOR UPDATE;

            SELECT status INTO v_status FROM public.pedidos_venda WHERE id = OLD.pedido_venda_id;
            IF v_status IS DISTINCT FROM 'rascunho' THEN
                RAISE EXCEPTION 'Não é permitido modificar itens de pedidos de venda concluídos ou cancelados.';
            END IF;

            SELECT status INTO v_status FROM public.pedidos_venda WHERE id = NEW.pedido_venda_id;
            IF v_status IS DISTINCT FROM 'rascunho' THEN
                RAISE EXCEPTION 'Não é permitido transferir itens para pedidos de venda concluídos ou cancelados.';
            END IF;
        ELSE
            SELECT status INTO v_status 
            FROM public.pedidos_venda 
            WHERE id = NEW.pedido_venda_id 
            FOR UPDATE;

            IF v_status IS DISTINCT FROM 'rascunho' THEN
                RAISE EXCEPTION 'Não é permitido modificar itens de pedidos de venda concluídos ou cancelados.';
            END IF;
        END IF;

        NEW.subtotal := ROUND(NEW.quantidade * NEW.preco_unitario, 2);
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_itens_pedido_venda_before_dml
BEFORE INSERT OR UPDATE OR DELETE ON public.itens_pedido_venda
FOR EACH ROW
EXECUTE FUNCTION public.check_itens_pedido_venda_before_dml();

-- 9. Trigger de Sincronização dos Totais de Itens (Disparada em AFTER com privilégio interno)
CREATE OR REPLACE FUNCTION public.sync_pedido_venda_totais()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.recalcular_totais_pedido_venda(OLD.pedido_venda_id);
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM public.recalcular_totais_pedido_venda(NEW.pedido_venda_id);
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.recalcular_totais_pedido_venda(NEW.pedido_venda_id);
        IF NEW.pedido_venda_id IS DISTINCT FROM OLD.pedido_venda_id THEN
            PERFORM public.recalcular_totais_pedido_venda(OLD.pedido_venda_id);
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

ALTER FUNCTION public.sync_pedido_venda_totais() OWNER TO postgres;

CREATE TRIGGER trg_itens_pedido_venda_after_dml
AFTER INSERT OR UPDATE OR DELETE ON public.itens_pedido_venda
FOR EACH ROW
EXECUTE FUNCTION public.sync_pedido_venda_totais();

-- 10. RPC Transacional: Concluir Pedido de Venda (Baixa de Estoque e Registro de Saída)
CREATE OR REPLACE FUNCTION public.concluir_pedido_venda(p_pedido_venda_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_usuario_id UUID;
    v_status VARCHAR;
    v_numero INTEGER;
    v_item RECORD;
    v_qtd_itens INTEGER;
BEGIN
    -- Validação de autenticação
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado: usuário não autenticado.';
    END IF;

    -- 1. Bloqueia o cabeçalho do pedido
    SELECT status, numero INTO v_status, v_numero
    FROM public.pedidos_venda
    WHERE id = p_pedido_venda_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido de venda não encontrado.';
    END IF;

    IF v_status = 'concluido' THEN
        RAISE EXCEPTION 'Este pedido de venda já foi concluído anteriormente.';
    END IF;

    IF v_status = 'cancelado' THEN
        RAISE EXCEPTION 'Não é possível concluir um pedido de venda cancelado.';
    END IF;

    -- Verifica se o pedido possui itens
    SELECT COUNT(*) INTO v_qtd_itens
    FROM public.itens_pedido_venda
    WHERE pedido_venda_id = p_pedido_venda_id;

    IF v_qtd_itens = 0 THEN
        RAISE EXCEPTION 'Não é possível concluir um pedido de venda sem itens.';
    END IF;

    -- 2. Habilita flag transacional para permitir a transição na trigger
    PERFORM set_config('app.internal_pedido_venda_transition', 'true', true);

    -- 3. Bloqueio determinístico de todos os produtos envolvidos por UUID ASC (Prevenção de Deadlock)
    PERFORM p.id
    FROM public.produtos p
    WHERE p.id IN (
        SELECT DISTINCT produto_id 
        FROM public.itens_pedido_venda 
        WHERE pedido_venda_id = p_pedido_venda_id
    )
    ORDER BY p.id ASC
    FOR UPDATE;

    -- 4. Validação de saldo em prateleira de todos os itens
    FOR v_item IN
        SELECT ipv.produto_id, ipv.quantidade, p.nome, p.quantidade AS estoque_atual
        FROM public.itens_pedido_venda ipv
        JOIN public.produtos p ON p.id = ipv.produto_id
        WHERE ipv.pedido_venda_id = p_pedido_venda_id
        ORDER BY ipv.produto_id ASC
    LOOP
        IF v_item.estoque_atual < v_item.quantidade THEN
            RAISE EXCEPTION 'Saldo insuficiente para o produto "%" (Disponível: %, Solicitado: %).',
                v_item.nome, v_item.estoque_atual, v_item.quantidade;
        END IF;
    END LOOP;

    -- 5. Atualiza o status do pedido para concluído
    UPDATE public.pedidos_venda
    SET status = 'concluido',
        atualizado_em = timezone('utc', now())
    WHERE id = p_pedido_venda_id;

    -- 6. Baixa física de estoque e geração de movimentações de saída auditáveis
    FOR v_item IN
        SELECT produto_id, quantidade
        FROM public.itens_pedido_venda
        WHERE pedido_venda_id = p_pedido_venda_id
        ORDER BY produto_id ASC
    LOOP
        UPDATE public.produtos
        SET quantidade = quantidade - v_item.quantidade,
            atualizado_em = timezone('utc', now())
        WHERE id = v_item.produto_id;

        INSERT INTO public.movimentacoes (
            produto_id,
            tipo,
            quantidade,
            usuario_id,
            motivo
        ) VALUES (
            v_item.produto_id,
            'saida',
            v_item.quantidade,
            v_usuario_id,
            'Venda - Pedido #PV-' || LPAD(v_numero::text, 6, '0')
        );
    END LOOP;
END;
$$;

ALTER FUNCTION public.concluir_pedido_venda(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.concluir_pedido_venda(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.concluir_pedido_venda(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.concluir_pedido_venda(UUID) TO authenticated;

-- 11. RPC Transacional: Cancelar Pedido de Venda (Com ou Sem Devolução Integral)
CREATE OR REPLACE FUNCTION public.cancelar_pedido_venda(
    p_pedido_venda_id UUID,
    p_retornar_estoque BOOLEAN,
    p_motivo TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_usuario_id UUID;
    v_status VARCHAR;
    v_numero INTEGER;
    v_item RECORD;
BEGIN
    -- Validação de autenticação
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado: usuário não autenticado.';
    END IF;

    -- 1. Bloqueia o cabeçalho do pedido
    SELECT status, numero INTO v_status, v_numero
    FROM public.pedidos_venda
    WHERE id = p_pedido_venda_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido de venda não encontrado.';
    END IF;

    IF v_status = 'cancelado' THEN
        RAISE EXCEPTION 'Este pedido de venda já se encontra cancelado.';
    END IF;

    -- 2. Habilita flag transacional para autorizar a transição na trigger
    PERFORM set_config('app.internal_pedido_venda_transition', 'true', true);

    -- 3. Cenário: Cancelamento de Rascunho
    IF v_status = 'rascunho' THEN
        UPDATE public.pedidos_venda
        SET status = 'cancelado',
            retornou_estoque = NULL,
            motivo_cancelamento = COALESCE(p_motivo, 'Rascunho cancelado pelo operador'),
            atualizado_em = timezone('utc', now())
        WHERE id = p_pedido_venda_id;
        RETURN;
    END IF;

    -- 4. Cenário: Cancelamento de Pedido Concluído
    IF v_status = 'concluido' THEN
        UPDATE public.pedidos_venda
        SET status = 'cancelado',
            retornou_estoque = COALESCE(p_retornar_estoque, false),
            motivo_cancelamento = p_motivo,
            atualizado_em = timezone('utc', now())
        WHERE id = p_pedido_venda_id;

        -- Se houver devolução física integral:
        IF p_retornar_estoque IS TRUE THEN
            -- Bloqueio determinístico de todos os produtos envolvidos por UUID ASC
            PERFORM p.id
            FROM public.produtos p
            WHERE p.id IN (
                SELECT DISTINCT produto_id 
                FROM public.itens_pedido_venda 
                WHERE pedido_venda_id = p_pedido_venda_id
            )
            ORDER BY p.id ASC
            FOR UPDATE;

            -- Reintegração física integral e registro de entrada em movimentações
            FOR v_item IN
                SELECT produto_id, quantidade
                FROM public.itens_pedido_venda
                WHERE pedido_venda_id = p_pedido_venda_id
                ORDER BY produto_id ASC
            LOOP
                UPDATE public.produtos
                SET quantidade = quantidade + v_item.quantidade,
                    atualizado_em = timezone('utc', now())
                WHERE id = v_item.produto_id;

                INSERT INTO public.movimentacoes (
                    produto_id,
                    tipo,
                    quantidade,
                    usuario_id,
                    motivo
                ) VALUES (
                    v_item.produto_id,
                    'entrada',
                    v_item.quantidade,
                    v_usuario_id,
                    'Devolução de Venda - Pedido #PV-' || LPAD(v_numero::text, 6, '0')
                );
            END LOOP;
        END IF;
    END IF;
END;
$$;

ALTER FUNCTION public.cancelar_pedido_venda(UUID, BOOLEAN, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.cancelar_pedido_venda(UUID, BOOLEAN, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancelar_pedido_venda(UUID, BOOLEAN, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancelar_pedido_venda(UUID, BOOLEAN, TEXT) TO authenticated;

-- 12. RPC Transacional: Exclusão Controlada de Rascunho com Validação de Autoria
CREATE OR REPLACE FUNCTION public.excluir_pedido_venda(p_pedido_venda_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_usuario_id UUID;
    v_status VARCHAR;
    v_dono_id UUID;
BEGIN
    -- Validação de autenticação
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado: usuário não autenticado.';
    END IF;

    -- Bloqueia o cabeçalho do pedido
    SELECT status, usuario_id INTO v_status, v_dono_id
    FROM public.pedidos_venda
    WHERE id = p_pedido_venda_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido de venda não encontrado.';
    END IF;

    -- Validação estrita de autoria: apenas o criador pode excluir o rascunho
    IF v_dono_id IS DISTINCT FROM v_usuario_id THEN
        RAISE EXCEPTION 'Acesso negado: você não tem permissão para excluir um rascunho criado por outro usuário.';
    END IF;

    -- Validação de ciclo de vida
    IF v_status IS DISTINCT FROM 'rascunho' THEN
        RAISE EXCEPTION 'Não é permitido excluir pedidos de venda concluídos ou cancelados. Apenas rascunhos podem ser excluídos.';
    END IF;

    -- Exclusão atômica dos itens (satisfaz ON DELETE RESTRICT)
    DELETE FROM public.itens_pedido_venda
    WHERE pedido_venda_id = p_pedido_venda_id;

    -- Exclusão do cabeçalho
    DELETE FROM public.pedidos_venda
    WHERE id = p_pedido_venda_id;
END;
$$;

ALTER FUNCTION public.excluir_pedido_venda(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.excluir_pedido_venda(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.excluir_pedido_venda(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.excluir_pedido_venda(UUID) TO authenticated;

-- 13. Políticas RLS e Privilégios Mínimos
ALTER TABLE public.pedidos_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido_venda ENABLE ROW LEVEL SECURITY;

-- Pedidos de Venda: Leitura ampla para autenticados
CREATE POLICY "pedidos_venda_select_policy"
ON public.pedidos_venda FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- Pedidos de Venda: Inserção permitida apenas para rascunho com autoria própria
CREATE POLICY "pedidos_venda_insert_policy"
ON public.pedidos_venda FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND status = 'rascunho'
    AND usuario_id = auth.uid()
);

-- Pedidos de Venda: Atualização permitida apenas em rascunhos
CREATE POLICY "pedidos_venda_update_policy"
ON public.pedidos_venda FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND status = 'rascunho')
WITH CHECK (auth.uid() IS NOT NULL AND status = 'rascunho');

-- Revoga DELETE direto em pedidos_venda para authenticated (exclusão estritamente via RPC)
REVOKE DELETE ON public.pedidos_venda FROM authenticated;

-- Revoga UPDATE amplo em pedidos_venda e concede apenas colunas editáveis em rascunho
REVOKE UPDATE ON public.pedidos_venda FROM authenticated;
GRANT UPDATE (cliente_id, observacoes, desconto) ON public.pedidos_venda TO authenticated;

-- Itens de Venda: Políticas RLS vinculadas a rascunhos do cabeçalho
CREATE POLICY "itens_pedido_venda_select_policy"
ON public.itens_pedido_venda FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "itens_pedido_venda_insert_policy"
ON public.itens_pedido_venda FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.pedidos_venda pv
        WHERE pv.id = itens_pedido_venda.pedido_venda_id
          AND pv.status = 'rascunho'
    )
);

CREATE POLICY "itens_pedido_venda_update_policy"
ON public.itens_pedido_venda FOR UPDATE TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.pedidos_venda pv
        WHERE pv.id = itens_pedido_venda.pedido_venda_id
          AND pv.status = 'rascunho'
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.pedidos_venda pv
        WHERE pv.id = itens_pedido_venda.pedido_venda_id
          AND pv.status = 'rascunho'
    )
);

CREATE POLICY "itens_pedido_venda_delete_policy"
ON public.itens_pedido_venda FOR DELETE TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.pedidos_venda pv
        WHERE pv.id = itens_pedido_venda.pedido_venda_id
          AND pv.status = 'rascunho'
    )
);
