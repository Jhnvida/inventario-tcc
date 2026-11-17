import { X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { modalRegistry } from "./modalRegistry";

export type ModalWidth = "small" | "medium" | "large";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    width?: ModalWidth;
}

const widthStyles: Record<ModalWidth, { mobile: string; desktop: string }> = {
    small: { mobile: "w-full sm:w-88", desktop: "lg:w-96" },
    medium: { mobile: "w-full sm:w-[420px]", desktop: "lg:w-[460px] xl:w-[500px]" },
    large: { mobile: "w-full sm:w-[520px]", desktop: "lg:w-[580px] xl:w-[640px]" },
};

export { modalRegistry };

export function Modal({ isOpen, onClose, title, subtitle, children, width = "medium" }: ModalProps) {
    const instanceId = useRef(`modal_${Math.random().toString(36).substring(2, 9)}`).current;
    const [isRendered, setIsRendered] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(isOpen);
    const [mountTarget, setMountTarget] = useState<HTMLElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setIsRendered(true);
        }
    }

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const root = document.getElementById("app-sidebar-root");
        setMountTarget(root || document.body);
    }, []);

    const forceInstantClose = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsVisible(false);
        setIsRendered(false);
    }, []);

    useEffect(() => {
        modalRegistry.register(instanceId, forceInstantClose);
        return () => {
            modalRegistry.unregister(instanceId);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [instanceId, forceInstantClose]);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (isOpen) {
            modalRegistry.notifyOpened(instanceId);
            setIsRendered(true);
            timerRef.current = setTimeout(() => {
                setIsVisible(true);
            }, 20);
        } else {
            modalRegistry.notifyClosed(instanceId);
            setIsVisible(false);
            const activeId = modalRegistry.getCurrentOpenModalId();
            if (activeId && activeId !== instanceId) {
                setIsRendered(false);
            } else {
                timerRef.current = setTimeout(() => {
                    setIsRendered(false);
                }, 280);
            }
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isOpen, instanceId]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isRendered) return null;

    const targetWidth = widthStyles[width] || widthStyles.medium;
    const fullWidthClass = `${targetWidth.mobile} ${targetWidth.desktop}`;
    const target = mountTarget || (typeof document !== "undefined" ? document.getElementById("app-sidebar-root") || document.body : null);
    const isSidebarRoot = target?.id === "app-sidebar-root";

    const content = (
        <>
            <div
                className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs ${
                    isSidebarRoot ? "lg:hidden" : ""
                } transition-opacity duration-280 ease-out ${
                    isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => onCloseRef.current()}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-xl overflow-hidden transition-all duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSidebarRoot
                        ? `lg:static lg:z-auto lg:h-full lg:shrink-0 lg:shadow-none ${
                              isVisible
                                  ? `${fullWidthClass} translate-x-0 opacity-100 lg:border-l lg:border-slate-200`
                                  : `${targetWidth.mobile} translate-x-full lg:translate-x-0 lg:w-0 opacity-0 pointer-events-none lg:border-l-0`
                          }`
                        : `${fullWidthClass} ${
                              isVisible
                                  ? "translate-x-0 opacity-100"
                                  : "translate-x-full opacity-0 pointer-events-none"
                          }`
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`flex flex-col h-full ${fullWidthClass} min-w-0 transition-opacity duration-200 ${
                        isVisible ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-white">
                        <div className="flex flex-col min-w-0 pr-2">
                            <h2 id="modal-title" className="text-sm font-semibold text-slate-900 truncate">
                                {title}
                            </h2>
                            {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
                        </div>
                        <button
                            type="button"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all duration-150 ease-out cursor-pointer shrink-0"
                            onClick={() => onCloseRef.current()}
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

    if (target) {
        return createPortal(content, target);
    }

    return content;
}
