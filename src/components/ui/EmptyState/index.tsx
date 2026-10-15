import { PackageOpen, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon = PackageOpen,
    title = "Nenhum registro encontrado",
    description,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-10 sm:p-14 bg-white rounded-lg border border-dashed border-slate-300 gap-2.5 ${className}`}
        >
            <Icon size={32} className="text-slate-400 mb-1 stroke-[1.5]" />
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
