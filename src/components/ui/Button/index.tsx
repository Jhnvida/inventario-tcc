import { type ButtonHTMLAttributes } from "react";
import styles from "./styles.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    fullWidth?: boolean;
}

export function Button({ children, variant = "primary", fullWidth = false, className = "", ...props }: ButtonProps) {
    const btnClasses = [styles.button, styles[variant], fullWidth ? styles.full_width : "", className]
        .filter(Boolean)
        .join(" ");

    return (
        <button className={btnClasses} {...props}>
            {children}
        </button>
    );
}
