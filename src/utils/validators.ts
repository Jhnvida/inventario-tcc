import { stripFormatting } from "./formatters";

export function validarCPF(cpf: string | null | undefined): boolean {
    if (!cpf) return false;
    const clean = stripFormatting(cpf);

    if (clean.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(clean)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(clean.charAt(i)) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(clean.charAt(9))) return false;

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(clean.charAt(i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(clean.charAt(10))) return false;

    return true;
}

export function validarCNPJ(cnpj: string | null | undefined): boolean {
    if (!cnpj) return false;
    const clean = stripFormatting(cnpj);

    if (clean.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(clean)) return false;

    let tamanho = 12;
    let numeros = clean.substring(0, tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += Number(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(clean.charAt(12))) return false;

    tamanho = 13;
    numeros = clean.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += Number(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(clean.charAt(13))) return false;

    return true;
}
