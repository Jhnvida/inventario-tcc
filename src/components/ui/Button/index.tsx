import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "dark";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent focus-visible:ring-slate-900/30 shadow-2xs",
    secondary:
        "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-slate-400/40 shadow-2xs",
    danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent focus-visible:ring-red-500/30 shadow-2xs",
    ghost:
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus-visible:ring-slate-400/40",
    outline:
        "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-slate-400/40 shadow-2xs",
    dark:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent focus-visible:ring-slate-900/30 shadow-2xs",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-9 px-3.5 text-sm gap-2 rounded-md",
    lg: "h-10 px-4 text-sm gap-2 rounded-md",
    icon: "h-9 w-9 p-0 rounded-md",
    "icon-sm": "h-7.5 w-7.5 p-0 rounded-md text-xs",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = "primary",
            size = "md",
            fullWidth = false,
            className = "",
            disabled,
            type = "button",
            ...props
        },
        ref,
    ) => {
        const vStyle = variantStyles[variant] || variantStyles.primary;
        const sStyle = sizeStyles[size] || sizeStyles.md;
        const widthStyle = fullWidth ? "w-full" : "";

        return (
            <button
                ref={ref}
                type={type}
                className={`inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-all duration-150 ease-out active:scale-[0.98] disabled:active:scale-100 ${vStyle} ${sStyle} ${widthStyle} ${className}`}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        );
    },
);

Button.displayName = "Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ghost" | "secondary" | "danger";
    size?: "sm" | "md";
    title: string;
    "aria-label"?: string;
    children: ReactNode;
}

export function IconButton({
    variant = "ghost",
    size = "sm",
    className = "",
    title,
    "aria-label": ariaLabel,
    children,
    disabled,
    type = "button",
    ...props
}: IconButtonProps) {
    const variantClass =
        variant === "danger"
            ? "text-slate-400 hover:text-red-600 hover:bg-red-50 focus-visible:ring-red-400/40"
            : variant === "secondary"
              ? "text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-400/40 shadow-2xs"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400/40";

    const sizeClass = size === "sm" ? "p-1.5 rounded-md" : "p-2 rounded-md";

    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center transition-all duration-150 ease-out active:scale-95 disabled:active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${variantClass} ${sizeClass} ${className}`}
            title={title}
            aria-label={ariaLabel || title}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
