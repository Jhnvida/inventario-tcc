import { BookText, Loader2, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAssistente } from "../../hooks/useAssistente";
import { MarkdownRenderer } from "./MarkdownRenderer";
import styles from "./styles.module.css";

const QUICK_PROMPTS = [
    "Qual é a previsão de esgotamento dos produtos com estoque baixo?",
    "Quais pedidos de reposição estão em aberto?",
    "Qual é o valor total do estoque atual?",
];

const PROMPT_LIBRARY = [
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

export function Assistente() {
    const [inputValue, setInputValue] = useState("");
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

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
        <div className="page-container" style={{ height: "100%", overflow: "hidden" }}>
            <PageHeader
                title="Assistente"
                subtitle="Consulte e interaja com os dados do seu inventário utilizando inteligência artificial."
            >
                {!isInitialState && (
                    <button
                        className="btn btn-secondary"
                        onClick={clearMessages}
                        title="Limpar conversa"
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <Trash2 size={16} />
                        Limpar Histórico
                    </button>
                )}
            </PageHeader>

            <div className={styles.chatWrapper}>
                <div className={styles.messagesContainer}>
                    {isInitialState && (
                        <div className={styles.emptyStateContainer}>
                            <h3>Como posso ajudar hoje?</h3>
                            <p>Selecione uma sugestão ou digite sua pergunta abaixo.</p>

                            <div className={styles.quickPrompts}>
                                {QUICK_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        className={styles.quickPromptBtn}
                                        onClick={() => handleQuickPrompt(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isInitialState &&
                        messages.map((msg) => (
                            <div key={msg.id} className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
                                <div className={styles.messageContentWrapper}>
                                    <div className={styles.messageBubble}>
                                        {msg.sender === "ai" ? <MarkdownRenderer content={msg.text} /> : msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}

                    {isLoading && messages[messages.length - 1]?.sender === "user" && (
                        <div className={`${styles.messageWrapper} ${styles.ai}`}>
                            <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
                                <div className={styles.typingIndicator}>
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputContainer}>
                    <form className={styles.inputArea} onSubmit={handleSend}>
                        <button
                            type="button"
                            className={styles.libraryButton}
                            onClick={() => setIsLibraryOpen(true)}
                            title="Biblioteca"
                        >
                            <BookText size={20} />
                        </button>

                        <textarea
                            ref={textareaRef}
                            placeholder="Faça uma pergunta sobre o estoque..."
                            className={styles.textarea}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                        />
                        <button type="submit" className={styles.sendButton} disabled={!inputValue.trim() || isLoading}>
                            {isLoading ? <Loader2 size={20} /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </div>

            <Modal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} title="Biblioteca">
                <div className={styles.libraryContainer}>
                    <p className={styles.libraryDesc}>
                        Selecione uma consulta para preencher o campo de mensagem e enviar ao assistente.
                    </p>

                    {PROMPT_LIBRARY.map((category, idx) => (
                        <div key={idx} className={styles.libraryCategory}>
                            <h4>{category.category}</h4>
                            <div className={styles.libraryList}>
                                {category.prompts.map((prompt, pIdx) => (
                                    <button
                                        key={pIdx}
                                        type="button"
                                        className={styles.libraryItem}
                                        onClick={() => handleSelectPrompt(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
