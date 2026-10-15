import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <header className={styles.header}>
            <div>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {children && <div className={styles.actions}>{children}</div>}
        </header>
    );
}
