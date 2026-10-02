import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./styles.module.css";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    itemName?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    itemName = "itens",
    disabled = false,
}: PaginationProps & { disabled?: boolean }) {
    if (totalItems <= 0) return null;

    const startIndex = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={styles.pagination_container}>
            <div className={styles.pagination_info}>
                Mostrando <strong className="fw600">{startIndex}</strong> a{" "}
                <strong className="fw600">{endIndex}</strong> de <strong className="fw600">{totalItems}</strong>{" "}
                {itemName}
            </div>

            <div className={styles.pagination_controls}>
                <button
                    type="button"
                    className={styles.pagination_btn}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || disabled}
                    title="Página anterior"
                >
                    <ChevronLeft size={16} />
                    <span>Anterior</span>
                </button>

                <span className={styles.page_indicator}>
                    Página <strong className="fw600">{currentPage}</strong> de{" "}
                    <strong className="fw600">{Math.max(1, totalPages)}</strong>
                </span>

                <button
                    type="button"
                    className={styles.pagination_btn}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || disabled}
                    title="Próxima página"
                >
                    <span>Próxima</span>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
