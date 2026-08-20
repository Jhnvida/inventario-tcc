import { type ReactNode } from "react";
import styles from "./styles.module.css";

interface BadgeProps {
    children: ReactNode;
    variant?: "success" | "critical" | "draft" | "neutral";
    className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
    const badgeClasses = [styles.badge, styles[variant], className].filter(Boolean).join(" ");
    return <span className={badgeClasses}>{children}</span>;
}
