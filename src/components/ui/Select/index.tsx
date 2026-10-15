import { type SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, className = "", children, id, required, ...props }, ref) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label htmlFor={selectId} className="text-xs font-medium text-slate-700">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative w-full">
                    <select
                        ref={ref}
                        id={selectId}
                        required={required}
                        className={`h-9 w-full appearance-none rounded-md border bg-white px-3 pr-8 text-sm text-slate-900 transition-colors focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
                            error
                                ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                                : "border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        } ${className}`}
                        {...props}
                    >
                        {children}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
                {error && <span className="text-xs text-red-600">{error}</span>}
                {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
            </div>
        );
    },
);

Select.displayName = "Select";
