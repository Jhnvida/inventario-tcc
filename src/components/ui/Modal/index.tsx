import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect } from "react";
import styles from "./styles.module.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: "small" | "medium" | "large";
}

export function Modal({ isOpen, onClose, title, children, width = "medium" }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={`${styles.modal} ${styles[width]}`}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>{title}</h2>
                            <button className={styles.close_btn} onClick={onClose} aria-label="Fechar modal">
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.content}>{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
