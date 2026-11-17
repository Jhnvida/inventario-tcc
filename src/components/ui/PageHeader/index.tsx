import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, children, action }: PageHeaderProps) {
    const actions = action || children;

    return (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-1">
            <div className="flex flex-col gap-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0">{actions}</div>}
        </header>
    );
}
