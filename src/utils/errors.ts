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

export function translateAuthError(error: any): string {
    if (!error) return "Ocorreu um erro na autenticação. Tente novamente.";

    const rawMessage = typeof error === "string" ? error : error.message || "";
    const message = rawMessage.toLowerCase();

    if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
        return "E-mail ou senha incorretos. Verifique suas credenciais de acesso.";
    }
    if (message.includes("user already registered") || message.includes("already registered")) {
        return "Este e-mail já está cadastrado no sistema. Tente entrar ou utilize outro endereço.";
    }
    if (message.includes("password should be at least") || message.includes("password is too short")) {
        return "A senha deve conter no mínimo 6 caracteres.";
    }
    if (message.includes("email not confirmed")) {
        return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada para prosseguir.";
    }
    if (message.includes("rate limit") || message.includes("too many requests") || message.includes("over email send")) {
        return "Muitas tentativas consecutivas. Por favor, aguarde alguns instantes e tente novamente.";
    }
    if (message.includes("network") || message.includes("failed to fetch")) {
        return "Falha de comunicação com o servidor. Verifique sua conexão com a internet.";
    }
    if (message.includes("invalid email") || message.includes("unable to validate email")) {
        return "O endereço de e-mail informado é inválido. Por favor, verifique o formato.";
    }
    if (message.includes("signup requires a valid password") || message.includes("missing password")) {
        return "Por favor, informe uma senha válida para o cadastro.";
    }
    if (message.includes("user not found")) {
        return "Usuário não localizado no sistema.";
    }
    if (message.includes("session") && (message.includes("expired") || message.includes("missing"))) {
        return "Sua sessão expirou. Por favor, realize o login novamente.";
    }
    if (message.includes("database error saving new user")) {
        return "Erro ao registrar os dados do novo usuário. Tente novamente em instantes.";
    }

    if (
        rawMessage &&
        !message.includes("error") &&
        !message.includes("invalid") &&
        !message.includes("user") &&
        !message.includes("request") &&
        !message.includes("failed")
    ) {
        return rawMessage;
    }

    return "Não foi possível concluir a autenticação. Verifique os dados e tente novamente.";
}
