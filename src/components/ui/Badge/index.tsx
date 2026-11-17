import { type ReactNode } from "react";

export type BadgeVariant =
    | "success"
    | "critical"
    | "warning"
    | "info"
    | "neutral"
    | "draft"
    | "primary"
    | "violet";

export interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
    dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
    success: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
    },
    critical: {
        badge: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
    },
    warning: {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
    },
    info: {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
    neutral: {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
    },
    draft: {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
    },
    primary: {
        badge: "bg-slate-100 text-slate-800 border-slate-300",
        dot: "bg-slate-700",
    },
    violet: {
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-500",
    },
};

export function Badge({ children, variant = "neutral", className = "", dot = false }: BadgeProps) {
    const config = variantStyles[variant] || variantStyles.neutral;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border select-none transition-colors duration-150 ease-out ${config.badge} ${className}`}
        >
            {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />}
            {children}
        </span>
    );
}

export type OrderStatus = "rascunho" | "enviado" | "concluido" | "cancelado";

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
    const normalized = (status || "").toLowerCase().trim();

    switch (normalized) {
        case "concluido":
        case "concluído":
            return (
                <Badge variant="success" dot className={className}>
                    Concluído
                </Badge>
            );
        case "enviado":
            return (
                <Badge variant="warning" dot className={className}>
                    Enviado
                </Badge>
            );
        case "cancelado":
            return (
                <Badge variant="critical" dot className={className}>
                    Cancelado
                </Badge>
            );
        case "rascunho":
            return (
                <Badge variant="neutral" dot className={className}>
                    Rascunho
                </Badge>
            );
        case "ativo":
            return (
                <Badge variant="success" dot className={className}>
                    Ativo
                </Badge>
            );
        case "inativo":
            return (
                <Badge variant="neutral" dot className={className}>
                    Inativo
                </Badge>
            );
        case "critico":
        case "crítico":
            return (
                <Badge variant="warning" dot className={className}>
                    Crítico
                </Badge>
            );
        case "zerado":
            return (
                <Badge variant="critical" dot className={className}>
                    Zerado
                </Badge>
            );
        case "aberto":
            return (
                <Badge variant="info" dot className={className}>
                    Aberto
                </Badge>
            );
        default:
            return (
                <Badge variant="neutral" dot className={className}>
                    {status || "Indefinido"}
                </Badge>
            );
    }
}
