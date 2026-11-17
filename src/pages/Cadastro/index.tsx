import { ArrowRight, CheckCircle2, Clock, Lock, Mail, User } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";
import { translateAuthError } from "../../utils/errors";

export function Cadastro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    async function handleCadastro(e: SubmitEvent) {
        e.preventDefault();
        setError(null);

        const nomeTrimmed = nome.trim();
        const emailTrimmed = email.trim().toLowerCase();

        if (!nomeTrimmed) {
            setError("Por favor, informe seu nome completo.");
            return;
        }

        if (password.length < 6) {
            setError("A senha deve conter no mínimo 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas digitadas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: emailTrimmed,
                password,
                options: {
                    data: {
                        nome: nomeTrimmed,
                        perfil: "operador",
                    },
                },
            });

            if (signUpError) {
                if (signUpError.message.includes("User already registered")) {
                    throw new Error("Este e-mail já está cadastrado no sistema.");
                }
                throw signUpError;
            }

            if (!data.user) {
                throw new Error("Não foi possível concluir o cadastro. Tente novamente.");
            }

            await supabase.auth.signOut();
            setSucesso(true);
        } catch (err: any) {
            console.error("Erro no cadastro:", err);
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans antialiased">
            <Card padding="large" className="w-full max-w-sm space-y-6 shadow-xs animate-fade-in-up">
                {sucesso ? (
                    <div className="text-center space-y-5 py-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <Clock size={24} />
                        </div>

                        <div className="space-y-1.5">
                            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                Cadastro Realizado!
                            </h2>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Sua solicitação de acesso foi registrada com sucesso e está com o status{" "}
                                <span className="font-semibold text-amber-700">Pendente</span>.
                            </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 space-y-2">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span>Os dados do seu cadastro foram gravados com segurança.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <span>Por política de segurança, o acesso só será liberado após a aprovação de um administrador.</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link to="/login" className="w-full block">
                                <Button fullWidth variant="primary">
                                    Ir para a Tela de Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-1.5">
                            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                                Criar Conta de Acesso
                            </h1>
                            <p className="text-xs text-slate-500">
                                Preencha os campos abaixo para solicitar seu acesso à plataforma.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleCadastro}>
                            {error && <Alert variant="error">{error}</Alert>}

                            <Input
                                label="Nome Completo"
                                type="text"
                                startIcon={<User size={15} />}
                                placeholder="Seu Nome Completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                autoFocus
                                autoComplete="name"
                            />

                            <Input
                                label="E-mail"
                                type="email"
                                startIcon={<Mail size={15} />}
                                placeholder="seu.email@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />

                            <Input
                                label="Senha"
                                type="password"
                                startIcon={<Lock size={15} />}
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            <Input
                                label="Confirmar Senha"
                                type="password"
                                startIcon={<Lock size={15} />}
                                placeholder="Repita sua senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            <div className="pt-2">
                                <Button type="submit" disabled={loading} fullWidth variant="primary">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Enviando solicitação...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1.5">
                                            <span>Cadastrar e Solicitar Acesso</span>
                                            <ArrowRight size={15} />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                            Já possui uma conta?{" "}
                            <Link to="/login" className="font-medium text-slate-900 hover:underline">
                                Acessar o sistema
                            </Link>
                        </div>
                    </>
                )}
            </Card>

            <p className="text-xs text-slate-400 mt-6 text-center">
                Sistema Web de Gestão Inteligente de Inventário
            </p>
        </div>
    );
}
