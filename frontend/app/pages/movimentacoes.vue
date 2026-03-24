<script setup lang="ts">
import type { Movimentacao } from "~/types";
definePageMeta({ titulo: "Movimentações" });

const movimentacoes: Movimentacao[] = [
    {
        id: 1,
        tipo: "entrada",
        produto: "Cabo HDMI 2.0",
        sku: "PRD-011",
        quantidade: 50,
        responsavel: "Carlos M.",
        observacao: "Reposição de estoque",
        data: "23/03/2026 09:14",
    },
    {
        id: 2,
        tipo: "saida",
        produto: "Teclado TK200",
        sku: "PRD-003",
        quantidade: 12,
        responsavel: "Ana S.",
        observacao: "Requisição depto. TI",
        data: "23/03/2026 08:30",
    },
    {
        id: 3,
        tipo: "saida",
        produto: 'Monitor 24" Full HD',
        sku: "PRD-007",
        quantidade: 3,
        responsavel: "Carlos M.",
        observacao: "Requisição depto. RH",
        data: "23/03/2026 07:55",
    },
    {
        id: 4,
        tipo: "entrada",
        produto: "Headset HX100",
        sku: "PRD-009",
        quantidade: 20,
        responsavel: "Rafael T.",
        observacao: "Reposição de estoque",
        data: "22/03/2026 17:40",
    },
    {
        id: 5,
        tipo: "saida",
        produto: "Mouse M320",
        sku: "PRD-005",
        quantidade: 8,
        responsavel: "Ana S.",
        observacao: "Substituição por defeito",
        data: "22/03/2026 15:22",
    },
    {
        id: 6,
        tipo: "entrada",
        produto: "Webcam WC100 HD",
        sku: "PRD-014",
        quantidade: 15,
        responsavel: "Rafael T.",
        observacao: "Compra inicial",
        data: "22/03/2026 11:05",
    },
    {
        id: 7,
        tipo: "saida",
        produto: "Cabo HDMI 2.0",
        sku: "PRD-011",
        quantidade: 5,
        responsavel: "Carlos M.",
        observacao: "Requisição sala de reunião",
        data: "21/03/2026 14:20",
    },
    {
        id: 8,
        tipo: "entrada",
        produto: "Mouse M320",
        sku: "PRD-005",
        quantidade: 30,
        responsavel: "Ana S.",
        observacao: "Reposição de estoque",
        data: "20/03/2026 10:00",
    },
    {
        id: 9,
        tipo: "saida",
        produto: "Headset HX100",
        sku: "PRD-009",
        quantidade: 4,
        responsavel: "Rafael T.",
        observacao: "Requisição depto. suporte",
        data: "19/03/2026 16:45",
    },
    {
        id: 10,
        tipo: "entrada",
        produto: "Teclado TK200",
        sku: "PRD-003",
        quantidade: 25,
        responsavel: "Carlos M.",
        observacao: "Reposição de estoque",
        data: "18/03/2026 09:30",
    },
];
</script>

<template>
    <div class="tbl-wrap">
        <div class="toolbar">
            <div class="busca">
                <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                <input type="text" placeholder="Buscar produto, SKU..." />
            </div>

            <select class="filtro-sel">
                <option value="">Todos os tipos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
            </select>

            <span class="flex-1" />

            <button class="botao botao-primario text-[13px]">
                <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                Nova Movimentação
            </button>
        </div>

        <table class="w-full border-collapse">
            <thead>
                <tr>
                    <th class="col-th">Tipo</th>
                    <th class="col-th">Produto</th>
                    <th class="col-th">SKU</th>
                    <th class="col-th">Qtd</th>
                    <th class="col-th">Responsável</th>
                    <th class="col-th">Criado em</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="m in movimentacoes" :key="m.id" class="linha">
                    <td class="col-td">
                        <Etiqueta :status="m.tipo === 'entrada' ? 'ok' : 'info'" :rotulo="m.tipo === 'entrada' ? 'Entrada' : 'Saída'" />
                    </td>
                    <td class="col-td font-medium">{{ m.produto }}</td>
                    <td class="col-td text-tx-mid">{{ m.sku }}</td>
                    <td class="col-td font-medium">{{ m.quantidade }}</td>
                    <td class="col-td text-tx-mid">{{ m.responsavel }}</td>
                    <td class="col-td text-tx-soft">{{ m.data }}</td>
                </tr>
            </tbody>
        </table>

        <div class="paginacao">
            <span class="pag-info">{{ movimentacoes.length }} movimentações</span>
        </div>
    </div>
</template>
