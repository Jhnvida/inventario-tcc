import { PackageOpen, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
    border?: "dashed" | "none";
}

export function EmptyState({
    icon: Icon = PackageOpen,
    title = "Nenhum registro encontrado",
    description,
    action,
    className = "",
    border = "dashed",
}: EmptyStateProps) {
    const borderClass = border === "dashed" ? "border border-dashed border-slate-300" : "border-0";

    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-10 sm:p-14 bg-white rounded-lg gap-2.5 animate-fade-in-up ${borderClass} ${className}`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-1">
                <Icon size={24} className="stroke-[1.75]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>}
            {action && <div className="mt-2.5">{action}</div>}
        </div>
    );
}
