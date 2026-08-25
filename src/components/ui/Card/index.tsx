import { motion } from "motion/react";
import { type ReactNode } from "react";
import styles from "./styles.module.css";

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: "none" | "small" | "medium" | "large";
}

export function Card({ children, className = "", padding = "medium" }: CardProps) {
    const cardClasses = [styles.card, styles[`pad-${padding}`], className].filter(Boolean).join(" ");
    return (
        <motion.div className={cardClasses} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            {children}
        </motion.div>
    );
}
