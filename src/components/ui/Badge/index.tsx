import { type ReactNode } from "react";

export type BadgeVariant = "success" | "critical" | "warning" | "draft" | "neutral" | "primary" | "violet";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    critical: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
    primary: "bg-slate-100 text-slate-800 border-slate-300",
    violet: "bg-slate-100 text-slate-800 border-slate-200",
};

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
    const style = variantStyles[variant] || variantStyles.neutral;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border select-none transition-colors duration-150 ease-out ${style} ${className}`}
        >
            {children}
        </span>
    );
}
