import { type ReactNode } from "react";

export type CardPadding = "none" | "small" | "medium" | "large";

interface CardProps {
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

export function Card({ children, className = "", padding = "medium" }: CardProps) {
    const padStyle = paddingStyles[padding] || paddingStyles.medium;

    return <div className={`bg-white border border-slate-200 rounded-lg ${padStyle} ${className}`}>{children}</div>;
}
