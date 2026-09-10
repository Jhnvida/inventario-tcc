import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAssistente } from "../../hooks/useAssistente";
import styles from "./styles.module.css";

export function Assistente() {
    const [inputValue, setInputValue] = useState("");
    const { messages, isLoading, sendMessage } = useAssistente();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    function handleSend(e: FormEvent) {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const text = inputValue;
        setInputValue("");
        sendMessage(text);
    }

    return (
        <div className="page-container" style={{ height: "100%", overflow: "hidden" }}>
            <PageHeader
                title="Assistente"
                subtitle="Consulte e interaja com os dados do seu inventário utilizando inteligência artificial."
            />

            <div className={styles.chatWrapper}>
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
                        placeholder="Faça uma pergunta sobre o estoque..."
                        className={styles.input}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className={styles.sendButton} disabled={!inputValue.trim() || isLoading}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
