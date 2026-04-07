<script setup lang="ts">
import type { Fornecedor } from "~/types";
definePageMeta({ titulo: "Fornecedores" });

const { data: fornecedores, pending, error } = useLazyFetch<Fornecedor[]>("/api/fornecedores");
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando fornecedores...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar fornecedores.</div>

        <div v-else-if="fornecedores" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input type="text" placeholder="Buscar fornecedores..." />
                </div>

                <span class="flex-1" />

                <button class="botao botao-primario text-[13px]">
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
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="f in fornecedores" :key="f.id" class="linha">
                        <td class="col-td font-medium">{{ f.razaoSocial }}</td>
                        <td class="col-td">{{ f.nomeFantasia }}</td>
                        <td class="col-td text-tx-mid">{{ f.cnpj }}</td>
                        <td class="col-td text-tx-mid">{{ f.contato }}</td>
                        <td class="col-td">{{ formatarPrazo(f.prazoMedio) }}</td>
                        <td class="col-td">
                            <Etiqueta :status="f.status" :rotulo="f.status === 'ok' ? 'Ativo' : 'Inativo'" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ fornecedores.length }} fornecedores</span>
            </div>
        </div>
    </div>
</template>
