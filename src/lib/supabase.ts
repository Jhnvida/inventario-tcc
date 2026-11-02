import { createClient } from "@supabase/supabase-js";

const env =
    typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env
        : ((globalThis as Record<string, any>).process?.env as Record<string, string | undefined>) || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("URL Supabase ou chave Anon está faltando nas variáveis ​​de ambiente.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
