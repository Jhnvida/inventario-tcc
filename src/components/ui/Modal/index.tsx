import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

export type ModalWidth = "small" | "medium" | "large";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: ModalWidth;
}

const widthStyles: Record<ModalWidth, string> = {
    small: "max-w-md",
    medium: "max-w-xl",
    large: "max-w-3xl",
};

export function Modal({ isOpen, onClose, title, children, width = "medium" }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                document.body.style.overflow = "unset";
                window.removeEventListener("keydown", handleKeyDown);
            };
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const wStyle = widthStyles[width] || widthStyles.medium;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 transition-opacity"
            onClick={onClose}
            role="presentation"
        >
            <div
                className={`relative flex flex-col w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-[90vh] ${wStyle}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 id="modal-title" className="text-base font-semibold text-slate-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={onClose}
                        aria-label="Fechar modal"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 flex-1 text-slate-700">{children}</div>
            </div>
        </div>
    );
}
