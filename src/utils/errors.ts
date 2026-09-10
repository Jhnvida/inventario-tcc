export function translateDbError(error: any): string {
    if (!error) return "Ocorreu um erro desconhecido.";
    const code = error.code || "";

    if (code === "23503") {
        return "Não é possível excluir este registro porque ele possui histórico (movimentações ou pedidos associados).";
    }
    if (code === "23505") {
        return "Este registro já está cadastrado no sistema (valor duplicado).";
    }
    if (code === "23514") {
        return "Valor inválido informado (verifique se a quantidade é maior que zero).";
    }

    return error.message || "Erro ao processar a operação. Tente novamente.";
}
