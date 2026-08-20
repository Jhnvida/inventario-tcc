import { ArrowRightLeft, LayoutDashboard, Package, ShoppingCart, Truck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./styles.module.css";

export function Layout() {
    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Inventário TCC</h2>
                </div>

                <nav className={styles.nav}>
                    <NavLink to="/" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/produtos"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                    >
                        <Package size={20} />
                        <span>Produtos</span>
                    </NavLink>

                    <NavLink
                        to="/movimentacoes"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                    >
                        <ArrowRightLeft size={20} />
                        <span>Movimentações</span>
                    </NavLink>

                    <NavLink
                        to="/pedidos"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                    >
                        <ShoppingCart size={20} />
                        <span>Pedidos</span>
                    </NavLink>

                    <NavLink
                        to="/fornecedores"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                    >
                        <Truck size={20} />
                        <span>Fornecedores</span>
                    </NavLink>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.userInfo}>
                        <span className={styles.avatar}>A</span>
                        <span className={styles.userName}>Administrador</span>
                    </div>
                </header>

                <div className={styles.pageContent}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
