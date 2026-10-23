import { useRef, useState } from "react";
import { systemPrompt } from "../services/ai/prompts";
import { classifyQueryIntent, REFUSAL_MESSAGE, sanitizeAndValidateResponse } from "../services/ai/scopeGuardrail";
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
    const abortControllerRef = useRef<AbortController | null>(null);
    const generationIdRef = useRef<number>(0);

    function addUserMessage(text: string) {
        historyRef.current.push({ role: "user", content: text });
        setMessages((prev) => [...prev, { id: Date.now().toString(), text, sender: "user" }]);
    }

    function addAiMessage(text: string) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), text, sender: "ai" }]);
    }

    function addErrorMessage(errorMessage: string) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), text: errorMessage, sender: "ai" }]);
    }

    function setUiFeedback(id: string, text: string) {
        setMessages((prev) => {
            const index = prev.findIndex((m) => m.id === id);
            if (index >= 0) {
                const next = [...prev];
                next[index] = { ...next[index], text };
                return next;
            }
            return [...prev, { id, text, sender: "ai" }];
        });
    }

    function removeUiFeedback(id: string) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
    }

    async function streamOllamaChat(
        chatHistory: ChatMessage[],
        onToken?: (token: string) => void,
        signal?: AbortSignal,
        enableTools = true,
    ): Promise<{ message: ChatMessage }> {
        const bodyPayload: any = {
            model: "llama3.2:3b",
            messages: chatHistory,
            stream: true,
        };

        if (enableTools) {
            bodyPayload.tools = tools;
        }

        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
            signal,
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Erro na IA (${response.status}): ${errorData}`);
        }

        if (!response.body) {
            throw new Error("Corpo de resposta de streaming indisponível.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let accumulatedContent = "";
        const toolCallsMap = new Map<number, any>();

        while (true) {
            if (signal?.aborted) {
                reader.cancel();
                throw new DOMException("Operação cancelada pelo usuário", "AbortError");
            }

            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                    const parsed = JSON.parse(trimmed);
                    const msg = parsed.message;
                    if (!msg) continue;

                    if (msg.content) {
                        accumulatedContent += msg.content;
                        if (onToken) {
                            onToken(msg.content);
                        }
                    }

                    if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
                        msg.tool_calls.forEach((tc: any, index: number) => {
                            const existing = toolCallsMap.get(index);
                            if (!existing) {
                                toolCallsMap.set(index, tc);
                            } else if (typeof tc.function?.arguments === "string") {
                                existing.function.arguments =
                                    (existing.function.arguments || "") + tc.function.arguments;
                            } else {
                                toolCallsMap.set(index, tc);
                            }
                        });
                    }
                } catch (err) {
                    console.warn("Falha ao parsear linha do stream:", trimmed, err);
                }
            }
        }

        if (buffer.trim()) {
            try {
                const parsed = JSON.parse(buffer.trim());
                const msg = parsed.message;
                if (msg?.content) {
                    accumulatedContent += msg.content;
                    if (onToken) onToken(msg.content);
                }
                if (msg?.tool_calls && Array.isArray(msg.tool_calls)) {
                    msg.tool_calls.forEach((tc: any, index: number) => {
                        if (!toolCallsMap.has(index)) toolCallsMap.set(index, tc);
                    });
                }
            } catch {}
        }

        const tool_calls = Array.from(toolCallsMap.values());
        const resultMessage: ChatMessage = {
            role: "assistant",
            content: accumulatedContent,
        };
        if (tool_calls.length > 0) {
            resultMessage.tool_calls = tool_calls;
        }

        return { message: resultMessage };
    }

    async function sendMessage(text: string) {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const currentController = new AbortController();
        abortControllerRef.current = currentController;
        const currentGenId = ++generationIdRef.current;

        addUserMessage(text);
        setIsLoading(true);

        const intent = classifyQueryIntent(text);

        if (intent === "OUT_OF_SCOPE") {
            historyRef.current.push({ role: "assistant", content: REFUSAL_MESSAGE });
            addAiMessage(REFUSAL_MESSAGE);
            setIsLoading(false);
            return;
        }

        const tempToolId = "temp-tool-msg";

        try {
            let streamingMsgId: string | null = null;
            let currentStreamText = "";

            const handleToken = (token: string) => {
                if (currentGenId !== generationIdRef.current) return;
                removeUiFeedback(tempToolId);
                if (!streamingMsgId) {
                    streamingMsgId = Date.now().toString();
                    currentStreamText = token;
                    setMessages((prev) => [
                        ...prev.filter((m) => m.id !== tempToolId),
                        { id: streamingMsgId!, text: currentStreamText, sender: "ai" },
                    ]);
                } else {
                    currentStreamText += token;
                    setMessages((prev) =>
                        prev.map((m) => (m.id === streamingMsgId ? { ...m, text: currentStreamText } : m)),
                    );
                }
            };

            const enableTools = intent === "IN_SCOPE";
            let response = await streamOllamaChat(
                historyRef.current,
                handleToken,
                currentController.signal,
                enableTools,
            );
            if (currentGenId !== generationIdRef.current) return;

            let responseMessage = response.message;

            while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                if (currentGenId !== generationIdRef.current) return;

                const refusalCall = responseMessage.tool_calls.find(
                    (tc: any) => tc.function?.name === "recusar_fora_do_escopo",
                );
                if (refusalCall) {
                    removeUiFeedback(tempToolId);
                    historyRef.current.push({ role: "assistant", content: REFUSAL_MESSAGE });
                    if (streamingMsgId) {
                        setMessages((prev) =>
                            prev.map((m) => (m.id === streamingMsgId ? { ...m, text: REFUSAL_MESSAGE } : m)),
                        );
                    } else {
                        addAiMessage(REFUSAL_MESSAGE);
                    }
                    setIsLoading(false);
                    return;
                }

                setUiFeedback(tempToolId, "Consultando dados no sistema...");
                historyRef.current.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    if (currentGenId !== generationIdRef.current) return;
                    const functionName = toolCall.function.name;
                    const functionArgs = toolCall.function.arguments;
                    const args = typeof functionArgs === "string" ? JSON.parse(functionArgs) : functionArgs;

                    const readableName = functionName.replace(/_/g, " ");
                    setUiFeedback(tempToolId, `Consultando dados (${readableName})...`);

                    const result = await handleFunctionCall({ name: functionName, args });
                    if (currentGenId !== generationIdRef.current) return;

                    historyRef.current.push({ role: "tool", content: JSON.stringify(result) });
                }

                streamingMsgId = null;
                currentStreamText = "";

                response = await streamOllamaChat(historyRef.current, handleToken, currentController.signal, true);
                if (currentGenId !== generationIdRef.current) return;

                responseMessage = response.message;
            }

            if (currentGenId !== generationIdRef.current) return;
            removeUiFeedback(tempToolId);

            if (responseMessage.content) {
                const sanitized = sanitizeAndValidateResponse(responseMessage.content);
                historyRef.current.push({ role: "assistant", content: sanitized });
                if (streamingMsgId) {
                    setMessages((prev) => prev.map((m) => (m.id === streamingMsgId ? { ...m, text: sanitized } : m)));
                } else {
                    addAiMessage(sanitized);
                }
            }
        } catch (error: any) {
            if (error.name === "AbortError" || currentGenId !== generationIdRef.current) {
                return;
            }
            console.error("Erro no chat:", error);
            removeUiFeedback(tempToolId);

            let errorMessage = "Desculpe, ocorreu um erro de processamento.";

            if (error.message?.includes("Failed to fetch")) {
                errorMessage =
                    "Não foi possível conectar à Inteligência Artificial. Verifique se o Ollama está em execução (ollama run llama3.2:3b).";
            }

            addErrorMessage(errorMessage);
        } finally {
            if (currentGenId === generationIdRef.current) {
                setIsLoading(false);
            }
        }
    }

    function clearMessages() {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        generationIdRef.current++;
        setIsLoading(false);
        historyRef.current = [{ role: "system", content: systemPrompt }];
        setMessages([
            {
                id: "initial",
                text: "Olá! Sou seu Assistente Inteligente. Como posso ajudar com o seu inventário hoje?",
                sender: "ai",
            },
        ]);
    }

    return { messages, isLoading, sendMessage, clearMessages };
}
