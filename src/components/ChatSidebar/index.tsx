import { Brain, Loader2, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
        <motion.aside
            className={styles.chatSidebar}
            initial={false}
            animate={{
                width: isOpen ? 400 : 0,
                borderLeftWidth: isOpen ? 1 : 0,
                borderLeftStyle: "solid",
                borderLeftColor: "var(--color-border)",
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
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
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                className={`${styles.messageWrapper} ${styles[msg.sender]}`}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className={styles.messageBubble}>
                                    {msg.sender === "ai" ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div
                                key="loading"
                                className={`${styles.messageWrapper} ${styles.ai}`}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div
                                    className={styles.messageBubble}
                                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                >
                                    <Loader2 size={16} className={styles.spinner} />
                                    Consultando dados...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
        </motion.aside>
    );
}
