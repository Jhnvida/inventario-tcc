import { ArrowRight, BookText, Bot, Loader2, Send, Trash2, Workflow } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ExecutionGraph } from "../../components/GraphCanvas/ExecutionGraph";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
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
        <div className="flex h-[calc(100vh-7rem)] flex-col">
            <PageHeader
                title="Assistente de Gestão"
                subtitle="Consulte indicadores, estoque crítico e histórico de movimentações com linguagem natural."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant={isGraphOpen ? "primary" : "secondary"}
                        size="sm"
                        onClick={toggleGraph}
                        title={isGraphOpen ? "Ocultar Grafo de Execução" : "Visualizar Grafo de Execução"}
                        className="text-xs"
                    >
                        <Workflow size={15} />
                        <span className="hidden sm:inline">
                            {isGraphOpen ? "Ocultar Grafo" : "Visualizar Grafo da IA"}
                        </span>
                    </Button>

                    {!isInitialState && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                clearMessages();
                                clearGraph();
                            }}
                            title="Limpar histórico da conversa"
                            className="text-xs text-slate-600 hover:text-red-600 hover:border-red-200"
                        >
                            <Trash2 size={16} className="text-slate-400 group-hover:text-red-500" />
                            <span>Limpar Histórico</span>
                        </Button>
                    )}
                </div>
            </PageHeader>

            <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
                <div
                    className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 ${
                        isGraphOpen ? "w-full lg:w-[48%] xl:w-[44%]" : "w-full"
                    }`}
                >
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
                        {isInitialState && (
                            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-6 text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Como posso ajudar com o estoque hoje?
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 max-w-md">
                                    Escolha uma consulta frequente abaixo ou digite sua pergunta para verificação em
                                    tempo real.
                                </p>

                                <div className="mt-5 w-full space-y-2">
                                    {QUICK_PROMPTS.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleQuickPrompt(prompt)}
                                            className="group flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <span>{prompt}</span>
                                            <ArrowRight
                                                size={15}
                                                className="text-slate-400 group-hover:text-slate-700 shrink-0 ml-2 transition-transform"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isInitialState &&
                            messages.map((msg) => {
                                const isAi = msg.sender === "ai";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
                                    >
                                        {isAi && (
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600 mt-0.5">
                                                <Bot className="h-3.5 w-3.5" />
                                            </div>
                                        )}

                                        <div
                                            className={`flex flex-col ${isAi ? "items-start max-w-[92%]" : "items-end max-w-[85%]"}`}
                                        >
                                            <div
                                                className={`rounded-lg px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                                                    isAi
                                                        ? "border border-slate-200 bg-white text-slate-800"
                                                        : "bg-slate-900 text-white font-normal"
                                                }`}
                                            >
                                                {isAi ? (
                                                    <MarkdownRenderer content={msg.text} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        {isLoading && messages[messages.length - 1]?.sender === "user" && (
                            <div className="flex items-start gap-2.5 justify-start">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600 mt-0.5">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-normal text-slate-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-700" />
                                    <span>Consultando inventário e gerando resposta...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {!isInitialState && !isLoading && (
                        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-200 bg-slate-50/75 px-3 py-1.5 text-xs">
                            <span className="text-[11px] font-medium text-slate-400 shrink-0">Sugestões:</span>
                            {SUGGESTIONS.map((sug, sIdx) => (
                                <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => handleQuickPrompt(sug)}
                                    className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-slate-200 bg-white p-3">
                        <form
                            onSubmit={handleSend}
                            className="flex items-end gap-1.5 rounded-md border border-slate-300 bg-white p-1.5 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all"
                        >
                            <button
                                type="button"
                                onClick={() => setIsLibraryOpen(true)}
                                title="Abrir Biblioteca de Consultas"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <BookText size={16} />
                            </button>

                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder="Faça uma pergunta sobre o inventário, estoque crítico, movimentações..."
                                rows={1}
                                className="max-h-36 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors cursor-pointer"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                            </button>
                        </form>
                    </div>
                </div>

                {isGraphOpen && (
                    <div className="hidden min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white lg:flex lg:w-[52%] xl:w-[56%]">
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
                title="Grafo de Raciocínio & Execução da IA"
            >
                <div className="h-[65vh] w-full">
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
                        Selecione um prompt pré-configurado para preencher a pergunta no assistente:
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
                                            className="group flex w-full items-center justify-between rounded-md border border-slate-200 bg-white p-2.5 text-left text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <span>{prompt}</span>
                                            <ArrowRight
                                                size={15}
                                                className="text-slate-400 group-hover:text-slate-700 shrink-0 ml-2"
                                            />
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
