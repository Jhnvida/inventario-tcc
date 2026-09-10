import {
    ArrowLeftRight,
    Brain,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ShoppingCart,
    Tags,
    UserCog,
    Users,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import styles from "./styles.module.css";

export function Layout() {
    const { user, signOut } = useAuth();
    const [userName, setUserName] = useState<string>(user?.user_metadata?.nome || "Usuário Logado");
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

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
    const currentPath = location.pathname;
    let pageTitle = "Inventário Inteligente";
    navSections.forEach((section) => {
        section.items.forEach((item) => {
            if (item.path === currentPath) pageTitle = item.label;
            else if (currentPath.startsWith(item.path) && item.path !== "/") {
                pageTitle = item.label;
            }
        });
    });
    if (currentPath === "/assistente") pageTitle = "Assistente";

    return (
        <div className={styles.app_layout}>
            {isMobile && isSidebarOpen && (
                <div className={styles.sidebar_overlay} onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? "" : styles.sidebar_closed}`}>
                <div className={`${styles.sidebar_header} ${!isSidebarOpen ? styles.sidebar_header_closed : ""}`}>
                    {isSidebarOpen && (
                        <div className={styles.logo_container}>
                            <span className={styles.logo_text}>Inventário Inteligente</span>
                        </div>
                    )}
                    <button className={styles.toggle_btn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <Menu size={20} />
                    </button>
                </div>

                <nav className={styles.sidebar_nav}>
                    {navSections.map((section) => (
                        <Fragment key={section.title}>
                            {isSidebarOpen && <div className={styles.nav_section}>{section.title}</div>}
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    title={!isSidebarOpen ? item.label : undefined}
                                    className={({ isActive }) =>
                                        `${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`
                                    }
                                >
                                    <item.icon size={20} className={styles.nav_icon} />
                                    {isSidebarOpen && <span className={styles.nav_label}>{item.label}</span>}
                                </NavLink>
                            ))}
                        </Fragment>
                    ))}

                    {isSidebarOpen && <div className={styles.nav_section}>Ferramentas</div>}
                    <NavLink
                        to="/assistente"
                        title={!isSidebarOpen ? "Assistente" : undefined}
                        className={({ isActive }) =>
                            `${styles.nav_item} ${styles.nav_item_highlight} ${isActive ? styles.nav_item_active : ""}`
                        }
                    >
                        <Brain size={20} className={styles.nav_icon} />
                        {isSidebarOpen && <span className={styles.nav_label}>Assistente</span>}
                    </NavLink>
                </nav>
            </aside>

            <main className={styles.main_content}>
                <header className={styles.top_header}>
                    <div className={styles.header_left}>
                        {isMobile && (
                            <button className={styles.toggle_btn_mobile} onClick={() => setSidebarOpen(true)}>
                                <Menu size={20} />
                            </button>
                        )}
                        <h2 className={styles.header_title}>{pageTitle}</h2>
                    </div>
                    <div className={styles.header_right}>
                        <div className={styles.user_profile}>
                            <div className={styles.user_details}>
                                <span className={styles.user_name}>{userName}</span>
                                <span className={styles.user_role}>Administrador</span>
                            </div>
                            <Button variant="ghost" className={styles.logout_btn} onClick={signOut} title="Sair">
                                <LogOut size={18} />
                            </Button>
                        </div>
                    </div>
                </header>

                <div className={styles.content_area}>
                    <div className={styles.content_container}>
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
