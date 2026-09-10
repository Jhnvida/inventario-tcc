import {
    ArrowLeftRight,
    Brain,
    LayoutDashboard,
    LogOut,
    Package,
    ShoppingCart,
    Tags,
    UserCog,
    Users,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import styles from "./styles.module.css";

export function Layout() {
    const { user, signOut } = useAuth();
    const [userName, setUserName] = useState<string>(user?.user_metadata?.nome || "Usuário Logado");

    const navSections = [
        {
            title: "Visão Geral",
            items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard }],
        },
        {
            title: "Gestão",
            items: [
                { path: "/produtos", label: "Produtos", icon: Package },
                { path: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
                { path: "/pedidos", label: "Pedidos", icon: ShoppingCart },
            ],
        },
        {
            title: "Cadastros",
            items: [
                { path: "/fornecedores", label: "Fornecedores", icon: Users },
                { path: "/categorias", label: "Categorias", icon: Tags },
                { path: "/usuarios", label: "Usuários", icon: UserCog },
            ],
        },
    ];

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
                    {navSections.map((section) => (
                        <Fragment key={section.title}>
                            <div className={styles.nav_section}>{section.title}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`
                                    }
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </Fragment>
                    ))}

                    <div className={styles.nav_section}>Ferramentas</div>
                    <NavLink
                        to="/assistente"
                        className={({ isActive }) => `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
                    >
                        <Brain size={18} />
                        Assistente Inteligente
                    </NavLink>
                </nav>

                <div className={styles.sidebar_footer}>
                    <div className={styles.user_info_container}>
                        <div className={styles.user_details}>
                            <div className={styles.user_name}>{userName}</div>
                            <div className={styles.user_email}>{user?.email}</div>
                        </div>
                    </div>
                    <div className={styles.footer_actions}>
                        <button className={`${styles.nav_item} ${styles.sidebar_btn}`} onClick={signOut}>
                            <LogOut size={18} />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            <main className={styles.main_content}>
                <div className={styles.content_area}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
