export const REFUSAL_MESSAGE =
    "Posso ajudar com informações e operações relacionadas ao inventário do sistema (produtos, estoque, movimentações, pedidos, fornecedores e relatórios). O que você gostaria de consultar?";

export type QueryIntent = "OUT_OF_SCOPE" | "GREETING_OR_SYSTEM_INFO" | "IN_SCOPE";

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

export function classifyQueryIntent(query: string): QueryIntent {
    const normalized = normalizeText(query);
    if (!normalized) return "IN_SCOPE";

    const jailbreakPatterns = [
        /(ignore|desconsidere|esqueca)\b.*?\b(instrucoes|regras|diretrizes)/i,
        /finja\s+que\s+(voce\s+e|e)\b/i,
        /responda\s+como\s+(um|outro)?\s*(assistente|ia\s+geral|dan|especialista)/i,
        /aja\s+como\s+se\s+fosse/i,
        /modo\s+dan\b/i,
        /jailbreak/i,
    ];

    if (jailbreakPatterns.some((pattern) => pattern.test(normalized))) {
        return "OUT_OF_SCOPE";
    }

    const outOfScopePatterns = [
        /qual\s+(e\s+)?a\s+capital\b/i,
        /capital\s+d[eao]\s+[a-z]+/i,
        /onde\s+fica\s+(o\s+pais|a\s+cidade|a\s+ilha)\b/i,
        /qual\s+o\s+pais\s+mais\s+(populoso|grande)/i,
        /quantos\s+paises\s+existem/i,
        /quem\s+(descobriu|colonizou)\s+o\s+brasil/i,
        /quem\s+(foi|inventou|descobriu|criou)\s+(pedro|alvares|cabral|napoleao|albert|einstein|a\s+lampada|o\s+aviao|a\s+internet|o\s+telefone)/i,
        /quando\s+comecou\s+a\s+(primeira|segunda)\s+guerra/i,
        /qual\s+o\s+sentido\s+da\s+vida/i,
        /(receita|como\s+fazer|como\s+preparar|ingredientes\s+para)\s+(de\s+)?(um\s+)?(bolo|torta|pao|almoco|jantar|pizza|lasanha|feijoada|sobremesa|strogonoff)/i,
        /(previsao\s+do\s+tempo|vai\s+chover|qual\s+a\s+temperatura)\b/i,
        /(conte|me\s+conta|diga)\s+uma?\s+(piada|charada|poema|poesia)/i,
        /escreva\s+um\s+poema/i,
        /escreva\s+um\s+codigo\s+(em\s+)?(python|javascript|c\+\+|java)\s+para\s+(calcular|ordenar|inverter|fibonacci)/i,
    ];

    if (outOfScopePatterns.some((pattern) => pattern.test(normalized))) {
        return "OUT_OF_SCOPE";
    }

    const greetingMatches = [
        /^(ola|oi|bom dia|boa tarde|boa noite|e ai|eai|opa|hello|hey)([\s,!.]+(bom dia|boa tarde|boa noite|tudo bem|como vai))?[\s!?.]*$/i,
        /^(tudo bem|como vai)[\s?!.]*$/i,
    ];
    if (greetingMatches.some((pattern) => pattern.test(normalized))) {
        return "GREETING_OR_SYSTEM_INFO";
    }

    const systemInfoMatches = [
        /^(o\s+que\s+voce\s+(pode|sabe|consegue)\s+fazer|como\s+voce\s+funciona|quais\s+sao\s+suas\s+funcionalidades|como\s+funciona\s+o\s+(sistema|assistente)(\s+de\s+inventario|\s+do\s+sistema)?|ajuda|como\s+usar\s+o\s+assistente)[\s?!.]*$/i,
    ];
    if (systemInfoMatches.some((pattern) => pattern.test(normalized))) {
        return "GREETING_OR_SYSTEM_INFO";
    }

    return "IN_SCOPE";
}

export function sanitizeAndValidateResponse(responseText: string): string {
    if (!responseText) return "";

    const text = responseText.trim();

    if (text.includes("recusar_fora_do_escopo") || text.includes('"recusado":true')) {
        return REFUSAL_MESSAGE;
    }

    const normalized = normalizeText(text);

    const refusalPhrases = [
        "nao esta relacionada ao sistema de inventario",
        "nao esta relacionado ao sistema de inventario",
        "fora do escopo do sistema de inventario",
        "fora do escopo do inventario",
        "nao esta dentro do escopo da minha funcao",
        "como assistente virtual do sistema de gestao de inventario",
        "meu escopo e estritamente limitado a gestao do inventario",
        "nao posso fornecer essa informacao",
        "nao tenho conhecimento sobre assuntos externos",
        "nao posso cumprir esse pedido",
    ];

    const hasRefusalRecognition = refusalPhrases.some((phrase) => normalized.includes(phrase));

    if (hasRefusalRecognition) {
        const leakagePatterns = [
            /a\s+capital\s+d[eao]\s+[a-z]+\s+e\s+/i,
            /kingston/i,
            /pedro\s+alvares\s+cabral/i,
            /descobriu\s+o\s+brasil/i,
            /receita/i,
            /ingredientes:/i,
            /temperatura\s+em/i,
            /foi\s+fundad[oa]/i,
            /no\s+entanto,\s+posso\s+dizer\s+que/i,
            /mas\s+a\s+capital\s+e/i,
        ];

        const hasLeakage = leakagePatterns.some((pattern) => pattern.test(text));

        if (hasLeakage) {
            return REFUSAL_MESSAGE;
        }

        if (
            normalized.includes("fora do escopo") ||
            normalized.includes("nao esta relacionada") ||
            normalized.includes("nao esta relacionado")
        ) {
            return REFUSAL_MESSAGE;
        }
    }

    return text;
}
