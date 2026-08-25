import { GoogleGenAI } from "@google/genai";
import { useRef, useState } from "react";
import { systemPrompt } from "../services/ai/prompts";
import { handleFunctionCall } from "../services/ai/toolHandlers";
import { tools } from "../services/ai/tools";

export type Message = {
    id: string;
    text: string;
    sender: "user" | "ai";
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
    const chatRef = useRef<any>(null);

    function initChat() {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

            chatRef.current = ai.chats.create({
                model: "gemini-3.6-flash",
                config: { systemInstruction: systemPrompt, tools: tools },
            });
        }

        return chatRef.current;
    }

    async function sendMessage(text: string) {
        const userMsgId = Date.now().toString();

        setMessages((prev) => [...prev, { id: userMsgId, text, sender: "user" }]);
        setIsLoading(true);

        try {
            const chat = initChat();
            let response = await chat.sendMessage({ message: text });

            while (response.functionCalls && response.functionCalls.length > 0) {
                const parts = [];

                for (const call of response.functionCalls) {
                    const result = await handleFunctionCall(call);
                    parts.push({
                        functionResponse: {
                            name: call.name,
                            response: { data: result },
                        },
                    });
                }

                response = await chat.sendMessage({ message: parts });
            }

            if (response.text) {
                setMessages((prev) => [...prev, { id: Date.now().toString(), text: response.text, sender: "ai" }]);
            }
        } catch (error: any) {
            console.error("Erro no chat:", error);

            let errorMessage = "Desculpe, ocorreu um erro ao processar sua solicitação.";

            if (error.message?.includes("API")) {
                errorMessage = "Erro de configuração: Verifique a chave da API do Gemini.";
            } else if (
                error.message?.includes("503") ||
                error.message?.includes("high demand") ||
                error.message?.includes("UNAVAILABLE")
            ) {
                errorMessage =
                    "O assistente está com alta demanda no momento. Por favor, aguarde alguns instantes e tente novamente.";
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: errorMessage,
                    sender: "ai",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    return { messages, isLoading, sendMessage };
}
