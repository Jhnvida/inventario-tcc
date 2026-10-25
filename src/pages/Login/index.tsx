import { AlertCircle, ArrowRight } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;
            navigate("/");
        } catch (err: any) {
            console.error("Erro na autenticação:", err);
            setError(err?.message || "E-mail ou senha inválidos. Verifique suas credenciais de acesso.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans antialiased">
            <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in-up">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-slate-900">Gestão de Inventário</h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Informe suas credenciais para acessar o sistema.
                        </p>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    {error && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-fade-in">
                            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="usuario@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Senha"
                        type="password"
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
            </div>

            <p className="text-xs text-slate-400 mt-6 text-center">Sistema Web de Gestão Inteligente de Inventário</p>
        </div>
    );
}
