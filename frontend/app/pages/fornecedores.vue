<script setup lang="ts">
import type { Fornecedor } from "~/types";
definePageMeta({ titulo: "Fornecedores" });

const fornecedores: Fornecedor[] = [
    {
        id: 1,
        razaoSocial: "Fornecedor A Ltda.",
        nomeFantasia: "Fornecedor A",
        cnpj: "00.000.001/0001-00",
        contato: "contato@fornecedora.com",
        prazoMedio: 7,
        status: "ok",
    },
    {
        id: 2,
        razaoSocial: "Fornecedor B S.A.",
        nomeFantasia: "Fornecedor B",
        cnpj: "00.000.002/0001-00",
        contato: "contato@fornecedorb.com",
        prazoMedio: 12,
        status: "ok",
    },
    {
        id: 3,
        razaoSocial: "Fornecedor C ME",
        nomeFantasia: "Fornecedor C",
        cnpj: "00.000.003/0001-00",
        contato: "contato@fornecedorc.com",
        prazoMedio: 21,
        status: "inativo",
    },
    {
        id: 4,
        razaoSocial: "Fornecedor D Distribuidora",
        nomeFantasia: "Fornecedor D",
        cnpj: "00.000.004/0001-00",
        contato: "contato@fornecedord.com",
        prazoMedio: 5,
        status: "ok",
    },
    {
        id: 5,
        razaoSocial: "Fornecedor E Ltda.",
        nomeFantasia: "Fornecedor E",
        cnpj: "00.000.005/0001-00",
        contato: "contato@fornecedore.com",
        prazoMedio: 10,
        status: "ok",
    },
];
</script>

<template>
    <div class="tbl-wrap">
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
</template>
