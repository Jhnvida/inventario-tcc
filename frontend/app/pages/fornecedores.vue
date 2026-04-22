<script setup lang="ts">
import type { Fornecedor } from "~/types";

definePageMeta({ titulo: "Fornecedores" });

const { data: fornecedores, pending, error, refresh } = useLazyFetch<Fornecedor[]>("/api/fornecedores");

const busca = ref("");
const abrir = ref(false);
const salvando = ref(false);
const erro = ref("");
const editId = ref<number | null>(null);
const ini = ref<Record<string, unknown>>({});

const lista = computed(() => {
    const termo = busca.value.trim().toLowerCase();
    return (fornecedores.value || []).filter((fornecedor) => {
        if (!termo) return true;
        return (
            fornecedor.razaoSocial.toLowerCase().includes(termo) ||
            (fornecedor.nomeFantasia || "").toLowerCase().includes(termo) ||
            (fornecedor.cnpj || "").toLowerCase().includes(termo)
        );
    });
});

function abrirNovoFornecedor() {
    erro.value = "";
    editId.value = null;
    ini.value = {};
    abrir.value = true;
}

function abrirEditarFornecedor(fornecedor: Fornecedor) {
    erro.value = "";
    editId.value = fornecedor.id;
    ini.value = {
        razaoSocial: fornecedor.razaoSocial || "",
        nomeFantasia: fornecedor.nomeFantasia || "",
        cnpj: fornecedor.cnpj || "",
        contato: fornecedor.contato || "",
        telefone: fornecedor.telefone || "",
        prazoMedio: Number(fornecedor.prazoMedio || 0),
        ativo: fornecedor.ativo ?? fornecedor.status === "ok",
    };
    abrir.value = true;
}

async function salvarFornecedor(payload: {
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string | null;
    contato: string | null;
    telefone: string | null;
    prazoMedio: number;
    ativo: boolean;
}) {
    erro.value = "";
    if (!payload.razaoSocial.trim()) {
        erro.value = "Preencha a razao social.";
        return;
    }

    if (payload.prazoMedio < 0) {
        erro.value = "Prazo medio deve ser >= 0.";
        return;
    }

    salvando.value = true;
    try {
        if (editId.value) {
            await $fetch(`/api/fornecedores/${editId.value}`, { method: "PUT", body: payload });
        } else {
            await $fetch("/api/fornecedores", { method: "POST", body: payload });
        }
        await refresh();
        abrir.value = false;
    } catch {
        erro.value = "Nao foi possivel salvar o fornecedor.";
    } finally {
        salvando.value = false;
    }
}

async function excluirFornecedor(id: number) {
    if (!confirm("Deseja remover este fornecedor?")) return;

    try {
        await $fetch(`/api/fornecedores/${id}`, { method: "DELETE" });
        await refresh();
    } catch {
        alert("Nao foi possivel remover o fornecedor.");
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando fornecedores...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar fornecedores.</div>

        <div v-else-if="fornecedores" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar fornecedores..." />
                </div>

                <span class="flex-1" />

                <button @click="abrirNovoFornecedor" class="botao botao-primario text-[13px]">
                    <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                    Novo Fornecedor
                </button>
            </div>

            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="col-th">Razão Social</th>
                        <th class="col-th">Nome Fantasia</th>
                        <th class="col-th">CNPJ</th>
                        <th class="col-th">Contato</th>
                        <th class="col-th">Prazo Médio</th>
                        <th class="col-th">Status</th>
                        <th class="col-th">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="f in lista" :key="f.id" class="linha">
                        <td class="col-td font-medium">{{ f.razaoSocial }}</td>
                        <td class="col-td">{{ f.nomeFantasia || "-" }}</td>
                        <td class="col-td text-tx-mid">{{ f.cnpj || "-" }}</td>
                        <td class="col-td text-tx-mid">{{ f.contato || "-" }}</td>
                        <td class="col-td">{{ formatarPrazo(f.prazoMedio || 0) }}</td>
                        <td class="col-td">
                            <Etiqueta :status="f.status" :rotulo="f.status === 'ok' ? 'Ativo' : 'Inativo'" />
                        </td>
                        <td class="col-td">
                            <div class="flex items-center gap-2">
                                <button @click="abrirEditarFornecedor(f)" class="botao botao-ghost !py-1 !px-2">
                                    Editar
                                </button>
                                <button @click="excluirFornecedor(f.id)" class="botao botao-ghost !py-1 !px-2 text-red">
                                    Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ lista.length }} fornecedores</span>
            </div>
        </div>

        <Painel v-model:aberto="abrir" :titulo="editId ? 'Editar Fornecedor' : 'Novo Fornecedor'">
            <FormFornecedor
                :initial="ini"
                :erro="erro"
                :salvando="salvando"
                @cancelar="abrir = false"
                @salvar="salvarFornecedor"
            />
        </Painel>
    </div>
</template>
