-- Migration: 20261001_create_clientes.sql
-- Descrição: Criação da tabela de clientes, restrições de integridade, trigger de atualização e políticas RLS.

CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo_pessoa VARCHAR(2) NOT NULL DEFAULT 'PF' CHECK (tipo_pessoa IN ('PF', 'PJ')),
    documento VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT timezone('utc', now()),
    atualizado_em TIMESTAMPTZ DEFAULT timezone('utc', now()),
    CONSTRAINT chk_clientes_documento_tipo CHECK (
        documento IS NULL 
        OR documento = '' 
        OR (tipo_pessoa = 'PF' AND length(documento) = 11 AND documento ~ '^[0-9]+$')
        OR (tipo_pessoa = 'PJ' AND length(documento) = 14 AND documento ~ '^[0-9]+$')
    )
);

-- Índices otimizados (índice único parcial em documento + índices em nome e ativo)
CREATE INDEX idx_clientes_nome ON public.clientes (nome);
CREATE INDEX idx_clientes_ativo ON public.clientes (ativo);
CREATE UNIQUE INDEX idx_clientes_documento_unique ON public.clientes (documento) WHERE documento IS NOT NULL AND documento <> '';

-- Função e Trigger para manter atualizado_em atualizado automaticamente
CREATE OR REPLACE FUNCTION public.handle_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.handle_clientes_updated_at();

-- RLS: Habilitação e política restrita a usuários autenticados
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow_ALL_for_authenticated"
ON public.clientes
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
