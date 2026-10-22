import { BookText, Loader2, Send, Trash2, Workflow } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ExecutionGraph } from "../../components/GraphCanvas/ExecutionGraph";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { ExecutionGraphProvider, useExecutionGraph } from "../../contexts/ExecutionGraphContext";
import { useAssistente } from "../../hooks/useAssistente";
import { MarkdownRenderer } from "./MarkdownRenderer";

const QUICK_PROMPTS = [
    "Qual é a previsão de esgotamento e pedidos em andamento dos produtos críticos?",
    "Faça a classificação da Curva ABC dos produtos nos últimos 90 dias.",
    "Quais pedidos de reposição estão em aberto com fornecedores?",
    "Qual é o valor financeiro e resumo geral do estoque?",
];

const SUGGESTIONS = [
    "Previsão de ruptura dos críticos",
    "Classificação Curva ABC (90 dias)",
    "Pedidos de compra em aberto",
    "Últimas movimentações de saída",
];

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

function AssistenteContent() {
    const [inputValue, setInputValue] = useState("");
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    const { messages, isLoading, sendMessage, clearMessages } = useAssistente();
    const { isGraphOpen, toggleGraph, steps, isRunning, currentPrompt, totalDurationMs, clearGraph, setIsGraphOpen } =
        useExecutionGraph();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    function handleSend(e?: FormEvent) {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const text = inputValue;
        setInputValue("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        sendMessage(text);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleSelectPrompt(prompt: string) {
        setIsLibraryOpen(false);
        setInputValue(prompt);
        textareaRef.current?.focus();
    }

    function handleQuickPrompt(prompt: string) {
        sendMessage(prompt);
    }

    const isInitialState = messages.length === 1 && messages[0].id === "initial";

    return (
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
            <div className="mb-2 flex items-center justify-end gap-2 shrink-0">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsLibraryOpen(true)}
                    title="Biblioteca de Consultas"
                    className="text-xs hidden sm:inline-flex"
                >
                    <BookText size={14} className="text-slate-500" />
                    <span>Consultas</span>
                </Button>

                <Button
                    variant={isGraphOpen ? "primary" : "secondary"}
                    size="sm"
                    onClick={toggleGraph}
                    title={isGraphOpen ? "Ocultar Grafo" : "Visualizar Grafo"}
                    className="text-xs"
                >
                    <Workflow size={14} />
                    <span className="hidden sm:inline">{isGraphOpen ? "Ocultar Grafo" : "Grafo"}</span>
                </Button>

                {!isInitialState && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            clearMessages();
                            clearGraph();
                        }}
                        title="Limpar histórico"
                        className="text-xs text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                        <Trash2 size={14} className="text-slate-400 group-hover:text-red-500" />
                        <span className="hidden sm:inline">Limpar</span>
                    </Button>
                )}
            </div>

            <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
                <div
                    className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 ${
                        isGraphOpen ? "w-full lg:w-[48%] xl:w-[45%]" : "w-full"
                    }`}
                >
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30">
                        {isInitialState && (
                            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center p-4">
                                <div className="w-full">
                                    <p className="mb-3 text-xs font-medium text-slate-400 text-center sm:text-left">
                                        Sugestões de consulta:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {QUICK_PROMPTS.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleQuickPrompt(prompt)}
                                                className="rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isInitialState &&
                            messages.map((msg) => {
                                const isAi = msg.sender === "ai";
                                return (
                                    <div key={msg.id} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                                        <div
                                            className={`text-xs sm:text-sm leading-relaxed ${
                                                isAi
                                                    ? "max-w-[95%] sm:max-w-[90%] rounded-lg border border-slate-200 bg-white p-4 text-slate-800"
                                                    : "max-w-[85%] sm:max-w-[75%] rounded-lg bg-slate-900 text-white px-4 py-2.5"
                                            }`}
                                        >
                                            {isAi ? (
                                                <MarkdownRenderer content={msg.text} />
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                        {isLoading && messages[messages.length - 1]?.sender === "user" && (
                            <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
                                <span>Consultando estoque...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {!isInitialState && !isLoading && (
                        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50/60 px-3 sm:px-4 py-2 text-xs shrink-0">
                            <span className="text-[11px] text-slate-400 shrink-0 mr-1">Sugestões:</span>
                            {SUGGESTIONS.map((sug, sIdx) => (
                                <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => handleQuickPrompt(sug)}
                                    className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-slate-200 bg-white p-2.5 sm:p-3 shrink-0">
                        <form
                            onSubmit={handleSend}
                            className="flex items-end gap-1.5 rounded-lg border border-slate-300 bg-white p-1.5 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all"
                        >
                            <button
                                type="button"
                                onClick={() => setIsLibraryOpen(true)}
                                title="Biblioteca de Consultas"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <BookText size={16} />
                            </button>

                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder="Pergunte sobre produtos, estoque crítico, movimentações..."
                                rows={1}
                                className="max-h-36 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                title="Enviar mensagem"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors cursor-pointer"
                            >
                                {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </form>
                    </div>
                </div>

                {isGraphOpen && (
                    <div className="hidden min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white lg:flex lg:w-[52%] xl:w-[55%]">
                        <ExecutionGraph
                            steps={steps}
                            isRunning={isRunning}
                            totalDurationMs={totalDurationMs}
                            prompt={currentPrompt}
                            onClear={clearGraph}
                        />
                    </div>
                )}
            </div>

            <Modal
                isOpen={isGraphOpen && typeof window !== "undefined" && window.innerWidth < 1024}
                onClose={() => setIsGraphOpen(false)}
                title="Grafo de Execução"
            >
                <div className="h-[75vh] w-full">
                    <ExecutionGraph
                        steps={steps}
                        isRunning={isRunning}
                        totalDurationMs={totalDurationMs}
                        prompt={currentPrompt}
                        onClear={clearGraph}
                    />
                </div>
            </Modal>

            <Modal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} title="Biblioteca de Consultas">
                <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Selecione uma consulta para preencher a pergunta no assistente:
                    </p>

                    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                        {PROMPT_LIBRARY.map((category, idx) => (
                            <div key={idx} className="space-y-1.5">
                                <h4 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                    {category.category}
                                </h4>
                                <div className="space-y-1">
                                    {category.prompts.map((prompt, pIdx) => (
                                        <button
                                            key={pIdx}
                                            type="button"
                                            onClick={() => handleSelectPrompt(prompt)}
                                            className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-left text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export function Assistente() {
    return (
        <ExecutionGraphProvider>
            <AssistenteContent />
        </ExecutionGraphProvider>
    );
}
