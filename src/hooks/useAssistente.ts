import { useRef, useState } from "react";
import { systemPrompt } from "../services/ai/prompts";
import { handleFunctionCall } from "../services/ai/toolHandlers";
import { tools } from "../services/ai/tools";

export type Message = {
    id: string;
    text: string;
    sender: "user" | "ai";
};

type ChatMessage = {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_calls?: any[];
};

export function useAssistente() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial",
            text: "Olá! Sou seu Assistente Inteligente. Como posso ajudar com o seu inventário hoje?",
            sender: "ai",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const historyRef = useRef<ChatMessage[]>([{ role: "system", content: systemPrompt }]);

    function addUserMessage(text: string) {
        historyRef.current.push({ role: "user", content: text });
        setMessages((prev) => [...prev, { id: Date.now().toString(), text, sender: "user" }]);
    }

    function addAiMessage(text: string) {
        historyRef.current.push({ role: "assistant", content: text });
        setMessages((prev) => [...prev, { id: Date.now().toString(), text, sender: "ai" }]);
    }

    function addErrorMessage(errorMessage: string) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), text: errorMessage, sender: "ai" }]);
    }

    function setUiFeedback(id: string, text: string) {
        setMessages((prev) => [...prev, { id, text, sender: "ai" }]);
    }

    function removeUiFeedback(id: string) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
    }

    async function sendToOllama(chatHistory: ChatMessage[]) {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama3.2:3b", messages: chatHistory, tools, stream: false }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Erro na IA (${response.status}): ${errorData}`);
        }

        return await response.json();
    }

    async function sendMessage(text: string) {
        addUserMessage(text);
        setIsLoading(true);

        const tempToolId = "temp-tool-msg";

        try {
            let response = await sendToOllama(historyRef.current);
            let responseMessage = response.message;

            if (responseMessage.tool_calls?.length > 0) {
                setUiFeedback(tempToolId, "Consultando banco de dados...");
            }

            while (responseMessage.tool_calls?.length > 0) {
                historyRef.current.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = toolCall.function.arguments;

                    const args = typeof functionArgs === "string" ? JSON.parse(functionArgs) : functionArgs;
                    const result = await handleFunctionCall({ name: functionName, args });

                    historyRef.current.push({ role: "tool", content: JSON.stringify(result) });
                }

                response = await sendToOllama(historyRef.current);
                responseMessage = response.message;
            }

            if (responseMessage.content) {
                removeUiFeedback(tempToolId);
                addAiMessage(responseMessage.content);
            }
        } catch (error: any) {
            console.error("Erro no chat:", error);
            removeUiFeedback(tempToolId);

            let errorMessage = "Desculpe, ocorreu um erro de processamento.";

            if (error.message?.includes("Failed to fetch")) {
                errorMessage = "Não foi possível conectar à Inteligência Artificial.";
            }

            addErrorMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    function clearMessages() {
        setMessages([
            {
                id: "initial",
                text: "Olá! Sou seu Assistente Inteligente. Como posso ajudar com o seu inventário hoje?",
                sender: "ai",
            },
        ]);
        historyRef.current = [{ role: "system", content: systemPrompt }];
    }

    return { messages, isLoading, sendMessage, clearMessages };
}
