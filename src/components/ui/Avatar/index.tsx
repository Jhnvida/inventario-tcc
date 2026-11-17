interface AvatarProps {
    name?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-7.5 h-7.5 text-xs",
    lg: "w-9 h-9 text-sm",
};

export function Avatar({ name = "Usuário", size = "md", className = "" }: AvatarProps) {
    const displayName = (name || "Usuário").trim();
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const sizeClass = sizeStyles[size] || sizeStyles.md;

    return (
        <div
            className={`rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center border border-slate-200 select-none shrink-0 transition-colors duration-150 ${sizeClass} ${className}`}
            title={displayName}
            aria-label={displayName}
        >
            {initials || "U"}
        </div>
    );
}
