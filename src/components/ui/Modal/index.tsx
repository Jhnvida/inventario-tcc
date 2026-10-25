import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export type ModalWidth = "small" | "medium" | "large";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: ModalWidth;
}

const widthStyles: Record<ModalWidth, string> = {
    small: "sm:w-84 lg:w-88 xl:w-96",
    medium: "sm:w-96 lg:w-[440px] xl:w-[480px]",
    large: "sm:w-[500px] lg:w-[560px] xl:w-[640px]",
};

const activeModals = new Map<string, () => void>();

function registerOpenModal(id: string, close: () => void) {
    activeModals.forEach((closeOther, otherId) => {
        if (otherId !== id) {
            closeOther();
        }
    });
    activeModals.set(id, close);
}

function unregisterModal(id: string) {
    activeModals.delete(id);
}

export function Modal({ isOpen, onClose, title, children, width = "medium" }: ModalProps) {
    const modalId = useId();
    const [isRendered, setIsRendered] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [mountTarget, setMountTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setMountTarget(document.getElementById("app-sidebar-root") || document.body);
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (isOpen) {
            registerOpenModal(modalId, onClose);

            setIsRendered(true);
            const animFrame = requestAnimationFrame(() => {
                setIsVisible(true);
            });

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            window.addEventListener("keydown", handleKeyDown);

            return () => {
                cancelAnimationFrame(animFrame);
                window.removeEventListener("keydown", handleKeyDown);
            };
        } else {
            unregisterModal(modalId);
            setIsVisible(false);
            timer = setTimeout(() => {
                setIsRendered(false);
            }, 300);

            return () => {
                if (timer) clearTimeout(timer);
            };
        }
    }, [isOpen, onClose, modalId]);

    useEffect(() => {
        return () => {
            unregisterModal(modalId);
        };
    }, [modalId]);

    if (!isRendered) return null;

    const targetWidth = widthStyles[width] || widthStyles.medium;

    const content = (
        <>
            <div
                className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity duration-300 ${
                    isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-xl transition-all duration-300 ease-in-out
                lg:static lg:z-auto lg:h-full lg:shrink-0 lg:border-l lg:border-slate-200 lg:shadow-none ${
                    isVisible
                        ? `${targetWidth} translate-x-0 opacity-100`
                        : "w-0 lg:w-0 translate-x-full lg:translate-x-0 opacity-0 pointer-events-none overflow-hidden"
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full w-full min-w-0">
                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-white">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <h2 id="modal-title" className="text-sm font-semibold text-slate-900 truncate">
                                {title}
                            </h2>
                        </div>
                        <button
                            type="button"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                            onClick={onClose}
                            title="Fechar painel"
                            aria-label="Fechar painel"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 text-slate-700">{children}</div>
                </div>
            </aside>
        </>
    );

    if (mountTarget) {
        return createPortal(content, mountTarget);
    }

    return content;
}
