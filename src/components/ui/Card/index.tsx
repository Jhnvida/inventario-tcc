import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type CardPadding = "none" | "small" | "medium" | "large";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    padding?: CardPadding;
}

const paddingStyles: Record<CardPadding, string> = {
    none: "p-0",
    small: "p-3 sm:p-4",
    medium: "p-4 sm:p-5",
    large: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, className = "", padding = "medium", ...props }, ref) => {
        const padStyle = paddingStyles[padding] || paddingStyles.medium;

        return (
            <div
                ref={ref}
                className={`bg-white border border-slate-200 rounded-lg shadow-2xs transition-all duration-150 ease-out ${padStyle} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    },
);

Card.displayName = "Card";

export function CardHeader({
    children,
    className = "",
    action,
}: {
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}) {
    return (
        <div className={`px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 ${className}`}>
            <div className="space-y-0.5 min-w-0">{children}</div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <h2 className={`text-sm font-semibold text-slate-900 tracking-tight ${className}`}>{children}</h2>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <p className={`text-xs text-slate-500 ${className}`}>{children}</p>;
}
