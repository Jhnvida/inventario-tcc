import { type LucideIcon } from "lucide-react";

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
    icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
    label?: string;
    value: T;
    onChange: (value: T) => void;
    options: SegmentedOption<T>[];
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

export function SegmentedControl<T extends string>({
    label,
    value,
    onChange,
    options,
    disabled = false,
    className = "",
    required = false,
}: SegmentedControlProps<T>) {
    return (
        <div className={`space-y-1.5 w-full ${className}`}>
            {label && (
                <label className="text-xs font-medium text-slate-700 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className={`grid gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200`}
                style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
                role="radiogroup"
                aria-label={label}
            >
                {options.map((option) => {
                    const isSelected = option.value === value;
                    const IconComponent = option.icon;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={disabled}
                            onClick={() => onChange(option.value)}
                            className={`flex items-center justify-center gap-2 h-8 px-3 rounded-md text-xs font-medium transition-all duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 ${
                                isSelected
                                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {IconComponent && (
                                <IconComponent
                                    size={14}
                                    className={isSelected ? "text-slate-900" : "text-slate-500"}
                                />
                            )}
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
