import { Brain, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAssistente } from "../../hooks/useAssistente";
import styles from "./styles.module.css";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const [inputValue, setInputValue] = useState("");
    const { messages, isLoading, sendMessage } = useAssistente();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e: SubmitEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const text = inputValue;
        setInputValue("");
        await sendMessage(text);
    };

    return (
        <aside className={`${styles.chatSidebar} ${isOpen ? styles.open : ""}`}>
            <div className={styles.sidebarContent}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <Brain size={20} className={styles.headerIcon} />
                        <h3>Assistente Inteligente</h3>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.messagesContainer}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
                            <div className={styles.messageBubble}>
                                {msg.sender === "ai" ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.messageWrapper} ${styles.ai}`}>
                            <div
                                className={styles.messageBubble}
                                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                            >
                                <Loader2 size={16} className={styles.spinner} />
                                Consultando dados...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Mensagem para o assistente..."
                        className={styles.input}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className={styles.sendButton} disabled={!inputValue.trim() || isLoading}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </aside>
    );
}
