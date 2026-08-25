import {
    ArrowLeftRight,
    Bell,
    LayoutDashboard,
    LogOut,
    Package,
    ShoppingCart,
    Tags,
    UserCog,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import styles from "./styles.module.css";

export function Layout() {
    const { user, signOut } = useAuth();
    const [userName, setUserName] = useState<string>(user?.user_metadata?.nome || "Usuário Logado");

    useEffect(() => {
        async function fetchUserName() {
            if (user) {
                try {
                    const { data: userData } = await supabase
                        .from("usuarios")
                        .select("nome")
                        .eq("id", user.id)
                        .single();

                    if (userData) {
                        setUserName(userData.nome);
                    }
                } catch (error) {
                    console.error("Erro ao buscar nome do usuário:", error);
                }
            }
        }
        fetchUserName();
    }, [user]);

    return (
        <div className={styles.app_layout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebar_header}>
                    <h2>Inventário Inteligente</h2>
                </div>

                <nav className={styles.sidebar_nav}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/produtos"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <Package size={18} />
                        Produtos
                    </NavLink>

                    <NavLink
                        to="/movimentacoes"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <ArrowLeftRight size={18} />
                        Movimentações
                    </NavLink>

                    <NavLink
                        to="/pedidos"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <ShoppingCart size={18} />
                        Pedidos
                    </NavLink>

                    <NavLink
                        to="/fornecedores"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <Users size={18} />
                        Fornecedores
                    </NavLink>

                    <NavLink
                        to="/categorias"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <Tags size={18} />
                        Categorias
                    </NavLink>

                    <NavLink
                        to="/usuarios"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <UserCog size={18} />
                        Usuários
                    </NavLink>
                </nav>

                <div className={styles.sidebar_footer}>
                    <div className={styles.user_info_container}>
                        <div className={styles.user_details}>
                            <div className={styles.user_name}>{userName}</div>
                            <div className={styles.user_email}>{user?.email}</div>
                        </div>
                    </div>
                    <button
                        className={styles.nav_item}
                        style={{ width: "100%", background: "transparent", border: "none" }}
                        onClick={signOut}
                    >
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </aside>

            <main className={styles.main_content}>
                <header className={styles.topbar}>
                    <div className={`${styles.flex} ${styles.items_center} ${styles.gap2} ${styles.text_secondary}`}>
                        {/* Removida a barra de busca a pedido do usuário */}
                    </div>
                    <div className={`${styles.flex} ${styles.items_center} ${styles.gap4}`}>
                        <button className={styles.icon_button}>
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                <div className={styles.content_area}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
