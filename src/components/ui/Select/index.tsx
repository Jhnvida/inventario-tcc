import { type SelectHTMLAttributes, forwardRef } from "react";
import styles from "./styles.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className = "", children, ...props }, ref) => {
        return (
            <div className={styles.container}>
                {label && <label className={styles.label}>{label}</label>}
                <select
                    ref={ref}
                    className={`${styles.select} ${error ? styles.selectError : ""} ${className}`}
                    {...props}
                >
                    {children}
                </select>
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    },
);

Select.displayName = "Select";
