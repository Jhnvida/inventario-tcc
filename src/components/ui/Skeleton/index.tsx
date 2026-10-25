interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`relative overflow-hidden bg-slate-200/70 rounded-md before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:animate-[skeleton-shimmer_1.6s_infinite] motion-reduce:before:animate-none ${className}`}
        />
    );
}
