import { motion, type HTMLMotionProps } from "motion/react";
import styles from "./styles.module.css";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    fullWidth?: boolean;
}

export function Button({ children, variant = "primary", fullWidth = false, className = "", ...props }: ButtonProps) {
    const btnClasses = [styles.button, styles[variant], fullWidth ? styles.full_width : "", className]
        .filter(Boolean)
        .join(" ");

    return (
        <motion.button className={btnClasses} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} {...props}>
            {children}
        </motion.button>
    );
}
