import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Usuario = {
    id: string;
    nome: string;
    email: string;
    perfil: "admin" | "operador";
    ativo: boolean;
    criado_em: string;
};

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchUsuarios() {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("usuarios").select("*").order("nome");

            if (error) throw error;
            setUsuarios(data || []);
        } catch (err: any) {
            console.error("Erro ao buscar usuários:", err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsuarios();
    }, []);

    async function updateUsuario(
        id: string,
        updates: { nome?: string; perfil?: "admin" | "operador"; ativo?: boolean },
    ) {
        try {
            const { error } = await supabase.from("usuarios").update(updates).eq("id", id);
            if (error) throw error;
            await fetchUsuarios();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            return { success: false, error: error.message };
        }
    }

    async function deleteUsuario(id: string) {
        try {
            const { error } = await supabase.from("usuarios").delete().eq("id", id);
            if (error) throw error;
            await fetchUsuarios();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir usuário:", error);
            return { success: false, error: error.message };
        }
    }

    return { usuarios, loading, recarregar: fetchUsuarios, updateUsuario, deleteUsuario };
}
