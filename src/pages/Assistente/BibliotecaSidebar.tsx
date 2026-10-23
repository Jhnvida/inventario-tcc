import { BookText, ChevronRight, Search, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

const PROMPT_LIBRARY = [
    {
        category: "Curva ABC e Gestão Financeira",
        prompts: [
            "Quais produtos fazem parte da Classe A da Curva ABC?",
            "Faça a classificação da Curva ABC dos produtos nos últimos 90 dias.",
            "Onde está concentrado o maior volume financeiro movimentado no estoque?",
        ],
    },
    {
        category: "Estoque Geral",
        prompts: [
            "Qual é o valor total do estoque atual?",
            "Quais produtos estão com estoque abaixo do mínimo?",
            "Quais são os 5 produtos com maior quantidade em estoque?",
        ],
    },
    {
        category: "Previsão e Ruptura",
        prompts: [
            "Qual é a previsão de esgotamento dos produtos críticos?",
            "Existe algum produto com risco iminente de ruptura?",
            "Quais produtos estão atualmente com estoque zerado?",
        ],
    },
    {
        category: "Movimentações",
        prompts: [
            "Mostre as últimas 5 movimentações de estoque.",
            "Quais produtos tiveram mais saídas neste mês?",
            "Quais foram as últimas entradas registradas?",
        ],
    },
    {
        category: "Pedidos de Compra",
        prompts: [
            "Quais pedidos de compra estão em aberto?",
            "Mostre os últimos pedidos de compra cadastrados.",
            "Quais pedidos de compra foram concluídos recentemente?",
        ],
    },
    {
        category: "Pedidos de Venda",
        prompts: [
            "Quais são os últimos pedidos de venda registrados?",
            "Mostre os pedidos de venda que estão em rascunho.",
            "Quais pedidos de venda foram concluídos recentemente?",
        ],
    },
];

interface BibliotecaSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPrompt: (prompt: string, autoSend?: boolean) => void;
}

export function BibliotecaSidebar({ isOpen, onClose, onSelectPrompt }: BibliotecaSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLibrary = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return PROMPT_LIBRARY;

        return PROMPT_LIBRARY.map((category) => {
            const matchesCategory = category.category.toLowerCase().includes(query);
            const matchingPrompts = category.prompts.filter(
                (prompt) => matchesCategory || prompt.toLowerCase().includes(query),
            );

            return {
                ...category,
                prompts: matchingPrompts,
            };
        }).filter((category) => category.prompts.length > 0);
    }, [searchQuery]);

    const totalPromptsCount = useMemo(() => {
        return filteredLibrary.reduce((acc, cat) => acc + cat.prompts.length, 0);
    }, [filteredLibrary]);

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xs sm:w-80 md:w-84 flex-col bg-white shadow-xl transition-all duration-200 ease-in-out
                lg:static lg:z-auto lg:h-full lg:w-80 xl:w-88 lg:shrink-0 lg:rounded-lg lg:border lg:border-slate-200 lg:shadow-2xs`}
            >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                            <BookText size={16} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-slate-900 truncate">Biblioteca de Consultas</h3>
                            <p className="text-[10px] text-slate-500">
                                {totalPromptsCount}{" "}
                                {totalPromptsCount === 1 ? "consulta disponível" : "consultas disponíveis"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Fechar biblioteca"
                            aria-label="Fechar biblioteca"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="border-b border-slate-100 p-2.5 bg-slate-50/60 shrink-0">
                    <div className="relative flex items-center">
                        <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filtrar consultas..."
                            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                title="Limpar busca"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
                    {filteredLibrary.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                            Nenhuma consulta encontrada para "{searchQuery}".
                        </div>
                    ) : (
                        filteredLibrary.map((category, idx) => (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase truncate">
                                        {category.category}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {category.prompts.length}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    {category.prompts.map((prompt, pIdx) => (
                                        <div
                                            key={pIdx}
                                            className="group relative flex items-start justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                                            onClick={() => onSelectPrompt(prompt, false)}
                                        >
                                            <span className="flex-1 leading-snug pr-2">{prompt}</span>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectPrompt(prompt, true);
                                                    }}
                                                    title="Enviar diretamente"
                                                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                                >
                                                    <Send size={12} />
                                                </button>
                                                <span className="text-slate-300">
                                                    <ChevronRight size={13} />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 bg-slate-50/50 shrink-0">
                    Clique para preencher o chat ou use o botão de envio rápido.
                </div>
            </aside>
        </>
    );
}
