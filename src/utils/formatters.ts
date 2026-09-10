export function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(dateString: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateString));
}

export function stripFormatting(value: string | null | undefined): string {
    if (!value) return "";
    return value.replace(/\D/g, "");
}

export function formatCNPJ(value: string | null | undefined): string {
    if (!value) return "";
    const cleanValue = stripFormatting(value);
    const truncated = cleanValue.slice(0, 14);

    return truncated
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatTelefone(value: string | null | undefined): string {
    if (!value) return "";
    const cleanValue = stripFormatting(value);
    const truncated = cleanValue.slice(0, 11);

    if (truncated.length <= 10) {
        return truncated.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    } else {
        return truncated.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
}
