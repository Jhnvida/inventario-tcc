import { ArrowRight, Lock, Mail } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";
import { translateAuthError } from "../../utils/errors";

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const state = location.state as { statusBloqueado?: string } | null;
        if (state?.statusBloqueado === "pendente") {
            setError("Seu cadastro foi realizado com sucesso, mas ainda está aguardando aprovação de um administrador.");
        } else if (state?.statusBloqueado === "recusado") {
            setError("O acesso desta conta foi recusado pela administração do sistema.");
        } else if (state?.statusBloqueado === "inativo") {
            setError("Esta conta está temporariamente inativada. Contate o administrador.");
        }
    }, [location.state]);

    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (authError) throw authError;

            if (!data.user) {
                throw new Error("Não foi possível autenticar o usuário.");
            }

            const { data: usuarioDb, error: userError } = await supabase
                .from("usuarios")
                .select("status, perfil, nome")
                .eq("id", data.user.id)
                .maybeSingle();

            if (userError) {
                console.error("Erro ao validar perfil:", userError);
            }

            if (usuarioDb?.status === "pendente") {
                await supabase.auth.signOut();
                setError("Seu cadastro está com o status Pendente. Aguarde a aprovação do administrador para acessar o sistema.");
                return;
            }

            if (usuarioDb?.status === "recusado") {
                await supabase.auth.signOut();
                setError("Sua solicitação de acesso foi recusada pela administração do sistema.");
                return;
            }

            if (usuarioDb?.status === "inativo") {
                await supabase.auth.signOut();
                setError("Sua conta de operador está inativada. Contate um administrador para restabelecer seu acesso.");
                return;
            }

            navigate("/");
        } catch (err: any) {
            console.error("Erro na autenticação:", err);
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans antialiased">
            <Card padding="large" className="w-full max-w-sm space-y-6 shadow-xs animate-fade-in-up">
                <div className="text-center space-y-1.5">
                    <h1 className="text-lg font-semibold tracking-tight text-slate-900">Gestão de Inventário</h1>
                    <p className="text-xs text-slate-500">
                        Informe suas credenciais para acessar a plataforma.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    {error && <Alert variant="error">{error}</Alert>}

                    <Input
                        label="E-mail"
                        type="email"
                        startIcon={<Mail size={15} />}
                        placeholder="usuario@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Senha"
                        type="password"
                        startIcon={<Lock size={15} />}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <div className="pt-2">
                        <Button type="submit" disabled={loading} fullWidth variant="primary">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Entrando...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-1.5">
                                    <span>Entrar</span>
                                    <ArrowRight size={15} />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                    Ainda não tem acesso?{" "}
                    <Link to="/cadastro" className="font-medium text-slate-900 hover:underline">
                        Solicitar cadastro
                    </Link>
                </div>
            </Card>

            <p className="text-xs text-slate-400 mt-6 text-center">Sistema Web de Gestão Inteligente de Inventário</p>
        </div>
    );
}
