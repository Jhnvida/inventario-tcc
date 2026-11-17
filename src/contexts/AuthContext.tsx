import { type Session, type User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { type Usuario } from "../types";

interface AuthContextType {
    user: User | null;
    usuario: Usuario | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    isAtivo: boolean;
    signOut: () => Promise<void>;
    recarregarUsuario: () => Promise<Usuario | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const carregarPerfilUsuario = useCallback(async (userId: string): Promise<Usuario | null> => {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", userId)
                .maybeSingle();

            if (error) {
                console.warn("Erro ao buscar perfil do usuário:", error.message);
                return null;
            }

            setUsuario(data as Usuario | null);
            return data as Usuario | null;
        } catch (err) {
            console.warn("Falha de rede ao consultar perfil do usuário:", err);
            return null;
        }
    }, []);

    const recarregarUsuario = useCallback(async () => {
        if (!user) return null;
        return await carregarPerfilUsuario(user.id);
    }, [user, carregarPerfilUsuario]);

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await carregarPerfilUsuario(session.user.id);
            } else {
                setUsuario(null);
            }
            if (isMounted) setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await carregarPerfilUsuario(session.user.id);
            } else {
                setUsuario(null);
            }
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [carregarPerfilUsuario]);

    async function signOut() {
        await supabase.auth.signOut();
        setUsuario(null);
        setUser(null);
        setSession(null);
    }

    const isAtivo = usuario?.status === "ativo";
    const isAdmin = usuario?.perfil === "admin";

    return (
        <AuthContext.Provider
            value={{
                user,
                usuario,
                session,
                loading,
                isAdmin,
                isAtivo,
                signOut,
                recarregarUsuario,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
