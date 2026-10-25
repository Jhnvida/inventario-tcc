import { type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dark" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent focus-visible:ring-slate-900/20",
    secondary:
        "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus-visible:ring-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent focus-visible:ring-red-500/20",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus-visible:ring-slate-300",
    dark: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent focus-visible:ring-slate-900/20",
    outline:
        "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-300",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-9 px-3.5 text-sm gap-2 rounded-md",
    lg: "h-10 px-4 text-sm gap-2 rounded-md",
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const vStyle = variantStyles[variant] || variantStyles.primary;
    const sStyle = sizeStyles[size] || sizeStyles.md;
    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            className={`inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-all duration-150 ease-out active:scale-[0.98] disabled:active:scale-100 ${vStyle} ${sStyle} ${widthStyle} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
