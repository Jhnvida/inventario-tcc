import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    itemName?: string;
    disabled?: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    itemName = "itens",
    disabled = false,
}: PaginationProps) {
    if (totalItems <= 0) return null;

    const startIndex = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600 select-none">
            <div className="text-center sm:text-left">
                Mostrando <strong className="font-semibold text-slate-900">{startIndex}</strong> a{" "}
                <strong className="font-semibold text-slate-900">{endIndex}</strong> de{" "}
                <strong className="font-semibold text-slate-900">{totalItems}</strong> {itemName}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 ease-out cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || disabled}
                    title="Página anterior"
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={15} />
                    <span>Anterior</span>
                </button>

                <span className="px-2 text-xs text-slate-500">
                    Página <strong className="font-semibold text-slate-900">{currentPage}</strong> de{" "}
                    <strong className="font-semibold text-slate-900">{Math.max(1, totalPages)}</strong>
                </span>

                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 ease-out cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || disabled}
                    title="Próxima página"
                    aria-label="Próxima página"
                >
                    <span>Próxima</span>
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
