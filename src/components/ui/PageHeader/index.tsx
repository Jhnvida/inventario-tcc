import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 max-w-2xl">{subtitle}</p>}
            </div>
            {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
        </header>
    );
}
