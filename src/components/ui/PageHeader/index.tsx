import { motion } from "motion/react";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <motion.header
            className={styles.header}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {children && <div className={styles.actions}>{children}</div>}
        </motion.header>
    );
}

