import { BookText, Loader2, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useAssistente } from "../../hooks/useAssistente";
import { BibliotecaSidebar } from "./BibliotecaSidebar";
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

export function Assistente() {
    const [inputValue, setInputValue] = useState("");
    const [isLibraryOpen, setIsLibraryOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const { messages, isLoading, sendMessage, clearMessages } = useAssistente();

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

    function handleSelectPrompt(prompt: string, autoSend?: boolean) {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setIsLibraryOpen(false);
        }

        if (autoSend) {
            sendMessage(prompt);
            return;
        }

        setInputValue(prompt);
        textareaRef.current?.focus();
    }

    function handleQuickPrompt(prompt: string) {
        sendMessage(prompt);
    }

    function handleClearAll() {
        clearMessages();
        setInputValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }

    const isInitialState = messages.length === 1 && messages[0].id === "initial";

    return (
        <div className="flex h-full w-full min-h-0 gap-3 lg:gap-4 overflow-hidden relative">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30">
                    {messages.map((msg) => {
                        if (msg.id === "temp-tool-msg") {
                            return (
                                <div key={msg.id} className="flex justify-start">
                                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-2xs">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                                        <span>{msg.text}</span>
                                    </div>
                                </div>
                            );
                        }

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

                    {isInitialState && (
                        <div className="pt-1">
                            <p className="mb-2.5 text-xs font-medium text-slate-400">Sugestões de consulta:</p>
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
                    )}

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
                        className="rounded-lg border border-slate-300 bg-white focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all flex flex-col shadow-xs"
                    >
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            placeholder="Pergunte sobre produtos, estoque crítico, movimentações... (Enter para enviar)"
                            rows={1}
                            className="w-full resize-none bg-transparent px-3 pt-2.5 pb-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[42px] max-h-36"
                        />

                        <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-1.5 bg-slate-50/50 rounded-b-lg">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setIsLibraryOpen((prev) => !prev)}
                                    title={
                                        isLibraryOpen
                                            ? "Recolher Biblioteca de Consultas"
                                            : "Exibir Biblioteca de Consultas"
                                    }
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                        isLibraryOpen
                                            ? "bg-slate-200/90 text-slate-900 font-semibold"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                                    }`}
                                >
                                    <BookText
                                        size={14}
                                        className={isLibraryOpen ? "text-slate-800" : "text-slate-500"}
                                    />
                                    <span className="hidden sm:inline">Consultas</span>
                                </button>

                                {!isInitialState && (
                                    <button
                                        type="button"
                                        onClick={handleClearAll}
                                        title="Limpar histórico de conversa"
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                        <span className="hidden sm:inline">Limpar</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center">
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    title="Enviar mensagem (Enter)"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span className="hidden sm:inline">Consultando</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Enviar</span>
                                            <Send size={13} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <BibliotecaSidebar
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelectPrompt={handleSelectPrompt}
            />
        </div>
    );
}
