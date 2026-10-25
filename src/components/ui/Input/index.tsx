import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = "", id, required, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label htmlFor={inputId} className="text-xs font-medium text-slate-700">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    required={required}
                    className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-150 ease-out disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
                        error
                            ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                            : "border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    } ${className}`}
                    {...props}
                />
                {error && <span className="text-xs text-red-600 animate-fade-in">{error}</span>}
                {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
            </div>
        );
    },
);

Input.displayName = "Input";
