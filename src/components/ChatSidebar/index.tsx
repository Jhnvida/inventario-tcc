import { Brain, Send, X } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import styles from "./styles.module.css";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ id: string; text: string; sender: "user" | "ai" }[]>([
        {
            id: "1",
            text: "Olá! Sou seu Assistente Inteligente. Como posso ajudar com o seu inventário hoje?",
            sender: "ai",
        },
    ]);

    const handleSend = (e: SubmitEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setMessages((prev) => [...prev, { id: Date.now().toString(), text: message, sender: "user" }]);
        setMessage("");

        // TODO: Adicionar integração real com LLM/MCP aqui
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
                            <div className={styles.messageBubble}>{msg.text}</div>
                        </div>
                    ))}
                </div>

                <form className={styles.inputArea} onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Mensagem para o assistente..."
                        className={styles.input}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" className={styles.sendButton} disabled={!message.trim()}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </aside>
    );
}
