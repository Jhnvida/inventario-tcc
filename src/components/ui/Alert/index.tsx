import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

export type AlertVariant = "error" | "warning" | "info" | "success";

interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: ReactNode;
    className?: string;
    icon?: LucideIcon;
}

const variantConfig: Record<AlertVariant, { container: string; iconClass: string; titleClass: string; defaultIcon: LucideIcon }> = {
    error: {
        container: "bg-red-50 border-red-200 text-red-700",
        iconClass: "text-red-600",
        titleClass: "text-red-900",
        defaultIcon: AlertCircle,
    },
    warning: {
        container: "bg-amber-50 border-amber-200 text-amber-800",
        iconClass: "text-amber-600",
        titleClass: "text-amber-950",
        defaultIcon: AlertTriangle,
    },
    info: {
        container: "bg-blue-50 border-blue-200 text-blue-700",
        iconClass: "text-blue-600",
        titleClass: "text-blue-900",
        defaultIcon: Info,
    },
    success: {
        container: "bg-emerald-50 border-emerald-200 text-emerald-700",
        iconClass: "text-emerald-600",
        titleClass: "text-emerald-900",
        defaultIcon: CheckCircle2,
    },
};

export function Alert({ variant = "error", title, children, className = "", icon }: AlertProps) {
    const config = variantConfig[variant] || variantConfig.error;
    const IconComponent = icon || config.defaultIcon;

    return (
        <div
            role="alert"
            className={`p-3 rounded-md border text-xs font-medium flex items-start gap-2.5 animate-fade-in ${config.container} ${className}`}
        >
            <IconComponent size={16} className={`shrink-0 mt-0.5 ${config.iconClass}`} />
            <div className="flex-1 space-y-0.5">
                {title && <p className={`font-semibold ${config.titleClass}`}>{title}</p>}
                <div>{children}</div>
            </div>
        </div>
    );
}
