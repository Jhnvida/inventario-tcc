import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import styles from "./styles.module.css";

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
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate("/");
        } catch (err) {
            setError("Algo deu errado!");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.login_layout}>
            <div className={styles.login_left}>
                <div className={styles.login_left_content}>
                    <h1>Inventário Inteligente</h1>
                    <p>
                        Acompanhe suas métricas, previna rupturas e otimize sua cadeia de suprimentos através de um
                        controle de estoque centralizado e inteligente.
                    </p>
                </div>

                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
            </div>

            <div className={styles.login_right}>
                <div className={styles.login_box}>
                    <h2>Acesse sua conta</h2>
                    <p className={styles.login_subtitle}>Insira suas credenciais corporativas.</p>

                    <form className={styles.login_form} onSubmit={handleLogin}>
                        {error && <div className={styles.error_message}>{error}</div>}
                        <div className={styles.form_group}>
                            <label className={styles.form_label}>E-mail corporativo</label>
                            <input
                                type="email"
                                placeholder="admin@empresa.com"
                                className={styles.input_field}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label className={styles.form_label}>Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className={styles.input_field}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className={styles.submit_btn}>
                            {loading ? "Entrando..." : "Entrar no Sistema"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
