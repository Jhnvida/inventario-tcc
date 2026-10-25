import {
    ArrowLeftRight,
    Brain,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Coins,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ShoppingCart,
    Tags,
    UserCheck,
    UserCog,
    Users,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export function Layout() {
    const { user, signOut } = useAuth();
    const [userName, setUserName] = useState<string>(user?.user_metadata?.nome || "Usuário Logado");
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (mobile) {
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

    useEffect(() => {
        async function fetchUserName() {
            if (user) {
                try {
                    const { data: userData } = await supabase
                        .from("usuarios")
                        .select("nome")
                        .eq("id", user.id)
                        .single();

                    if (userData?.nome) {
                        setUserName(userData.nome);
                    }
                } catch (error) {
                    console.error("Erro ao buscar nome do usuário:", error);
                }
            }
        }
        fetchUserName();
    }, [user]);

    const navSections = [
        {
            title: "Visão Geral",
            items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard }],
        },
        {
            title: "Gestão de Estoque",
            items: [
                { path: "/produtos", label: "Produtos", icon: Package },
                { path: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
                { path: "/pedidos", label: "Pedidos de Compra", icon: ShoppingCart },
                { path: "/pedidos-venda", label: "Pedidos de Venda", icon: Coins },
            ],
        },
        {
            title: "Cadastros Base",
            items: [
                { path: "/clientes", label: "Clientes", icon: UserCheck },
                { path: "/fornecedores", label: "Fornecedores", icon: Users },
                { path: "/categorias", label: "Categorias", icon: Tags },
                { path: "/usuarios", label: "Usuários", icon: UserCog },
            ],
        },
        {
            title: "Ferramentas",
            items: [{ path: "/assistente", label: "Assistente IA", icon: Brain }],
        },
    ];

    const currentPath = location.pathname;
    const isAssistente = currentPath.startsWith("/assistente");
    let pageTitle = "Dashboard";
    let sectionTitle = "Visão Geral";

    navSections.forEach((section) => {
        section.items.forEach((item) => {
            if (item.path === currentPath) {
                pageTitle = item.label;
                sectionTitle = section.title;
            } else if (currentPath.startsWith(item.path) && item.path !== "/") {
                pageTitle = item.label;
                sectionTitle = section.title;
            }
        });
    });

    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const todayFormatted = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date());

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/30 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0 bg-white border-r border-slate-200 transition-all duration-200 ease-in-out ${
                    isSidebarOpen ? "w-60 translate-x-0" : isMobile ? "-translate-x-full w-60" : "w-16 translate-x-0"
                }`}
            >
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        {isSidebarOpen && (
                            <span className="text-sm font-semibold tracking-tight text-slate-900 truncate">
                                Gestão de Inventário
                            </span>
                        )}
                    </div>

                    {!isMobile && (
                        <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            title={isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
                        >
                            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}

                    {isMobile && (
                        <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Fechar menu"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {isSidebarOpen && (
                                <div className="px-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                    {section.title}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        title={!isSidebarOpen ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                                                isActive
                                                    ? "bg-slate-100 text-slate-900 font-semibold"
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            } ${!isSidebarOpen ? "justify-center px-0" : ""}`
                                        }
                                    >
                                        <item.icon
                                            size={16}
                                            className="shrink-0 text-slate-500 group-hover:text-slate-900"
                                        />
                                        {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3 min-w-0">
                        {isMobile && (
                            <button
                                type="button"
                                className="p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Abrir menu"
                            >
                                <Menu size={18} />
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="hidden sm:inline">{sectionTitle}</span>
                            <span className="hidden sm:inline text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold">{pageTitle}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar size={15} className="text-slate-400" />
                            <span>{todayFormatted}</span>
                        </div>

                        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-200 select-none shrink-0">
                                {userInitials || "U"}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-medium text-slate-900 truncate max-w-35">{userName}</span>
                            </div>
                            <button
                                type="button"
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                                onClick={signOut}
                                title="Encerrar sessão"
                                aria-label="Sair"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex min-h-0 overflow-hidden relative">
                    <main
                        className={`flex-1 min-h-0 bg-slate-50 transition-all duration-300 ${
                            isAssistente
                                ? "overflow-hidden p-2 sm:p-3 lg:p-4 flex flex-col"
                                : "overflow-y-auto p-4 sm:p-6 lg:p-8"
                        }`}
                    >
                        <div
                            className={
                                isAssistente ? "w-full h-full flex flex-col min-h-0" : "max-w-6xl mx-auto w-full"
                            }
                        >
                            <Outlet />
                        </div>
                    </main>

                    <div id="app-sidebar-root" className="flex shrink-0 min-h-0 h-full" />
                </div>
            </div>
        </div>
    );
}
