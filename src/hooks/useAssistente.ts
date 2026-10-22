import { useRef, useState } from "react";
import { systemPrompt } from "../services/ai/prompts";
import { handleFunctionCall } from "../services/ai/toolHandlers";
import { tools } from "../services/ai/tools";
import { tracer } from "../services/ai/tracer";

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

    async function streamOllamaChat(
        chatHistory: ChatMessage[],
        onToken?: (token: string) => void,
    ): Promise<{ message: ChatMessage }> {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3.2:3b",
                messages: chatHistory,
                tools,
                stream: true,
            }),
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
        addUserMessage(text);
        setIsLoading(true);

        const traceStartTime = performance.now();
        tracer.startTrace(text);

        tracer.updateStep({
            id: "user-input",
            stepType: "user_input",
            label: "Entrada do Usuário",
            sublabel: text,
            status: "success",
            iconType: "user",
        });

        const tDecisionStart = performance.now();
        tracer.updateStep({
            id: "llm-decision",
            parentId: "user-input",
            stepType: "llm_decision",
            label: "Llama 3.2: Avaliação de Intenção",
            sublabel: "Avaliando necessidade de consulta ao banco...",
            status: "running",
            iconType: "bot",
        });

        let lastNodeId = "llm-decision";
        const tempToolId = "temp-tool-msg";

        try {
            let streamingMsgId: string | null = null;
            let currentStreamText = "";

            const handleToken = (token: string) => {
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

            let response = await streamOllamaChat(historyRef.current, handleToken);
            let responseMessage = response.message;
            const tDecisionMs = Math.round(performance.now() - tDecisionStart);

            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                tracer.updateStep({
                    id: "llm-decision",
                    status: "success",
                    durationMs: tDecisionMs,
                    sublabel: `${responseMessage.tool_calls.length} consulta(s) necessária(s)`,
                });
            } else {
                tracer.updateStep({
                    id: "llm-decision",
                    status: "success",
                    durationMs: tDecisionMs,
                    sublabel: "Resposta direta sem consultas adicionais",
                });
            }

            while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                setUiFeedback(tempToolId, "Consultando dados no sistema...");
                historyRef.current.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = toolCall.function.arguments;
                    const args = typeof functionArgs === "string" ? JSON.parse(functionArgs) : functionArgs;

                    const readableName = functionName.replace(/_/g, " ");
                    setUiFeedback(tempToolId, `Consultando dados (${readableName})...`);

                    const toolNodeId = `tool-${functionName}-${Date.now()}`;
                    const tToolStart = performance.now();

                    tracer.updateStep({
                        id: toolNodeId,
                        parentId: lastNodeId,
                        stepType: "tool_call",
                        label: `Tool: ${readableName}`,
                        sublabel: JSON.stringify(args),
                        status: "running",
                        iconType: "tool",
                        metadata: { functionName, args },
                    });

                    const result = await handleFunctionCall({ name: functionName, args }, toolNodeId);
                    const tToolMs = Math.round(performance.now() - tToolStart);

                    tracer.updateStep({
                        id: toolNodeId,
                        status: "success",
                        durationMs: tToolMs,
                        sublabel: `Concluído em ${tToolMs}ms`,
                        metadata: {
                            functionName,
                            args,
                            resultSummary: Array.isArray(result) ? `${result.length} registros` : result,
                        },
                    });

                    lastNodeId = toolNodeId;
                    historyRef.current.push({ role: "tool", content: JSON.stringify(result) });
                }

                streamingMsgId = null;
                currentStreamText = "";

                const synthNodeId = `llm-synthesis-${Date.now()}`;
                const tSynthStart = performance.now();

                tracer.updateStep({
                    id: synthNodeId,
                    parentId: lastNodeId,
                    stepType: "llm_synthesis",
                    label: "Llama 3.2: Síntese e Formatação",
                    sublabel: "Formatando tabelas e resposta determinística...",
                    status: "running",
                    iconType: "bot",
                });

                response = await streamOllamaChat(historyRef.current, handleToken);
                responseMessage = response.message;
                const tSynthMs = Math.round(performance.now() - tSynthStart);

                tracer.updateStep({
                    id: synthNodeId,
                    status: "success",
                    durationMs: tSynthMs,
                    sublabel: `Síntese concluída em ${tSynthMs}ms`,
                });

                lastNodeId = synthNodeId;
            }

            removeUiFeedback(tempToolId);

            if (responseMessage.content) {
                historyRef.current.push({ role: "assistant", content: responseMessage.content });
                if (streamingMsgId) {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === streamingMsgId ? { ...m, text: responseMessage.content } : m)),
                    );
                } else {
                    addAiMessage(responseMessage.content);
                }
            }

            const totalPipelineMs = Math.round(performance.now() - traceStartTime);
            tracer.updateStep({
                id: "final-output",
                parentId: lastNodeId,
                stepType: "output",
                label: "Resposta Entregue",
                sublabel: `Concluído em ${(totalPipelineMs / 1000).toFixed(2)}s`,
                status: "success",
                iconType: "check",
                durationMs: totalPipelineMs,
            });
            tracer.finishTrace(true, totalPipelineMs);
        } catch (error: any) {
            console.error("Erro no chat:", error);
            removeUiFeedback(tempToolId);

            tracer.updateStep({
                id: "error-node",
                parentId: lastNodeId,
                stepType: "output",
                label: "Falha na Execução",
                sublabel: error.message || "Erro desconhecido",
                status: "error",
                iconType: "alert",
            });
            tracer.finishTrace(false);

            let errorMessage = "Desculpe, ocorreu um erro de processamento.";

            if (error.message?.includes("Failed to fetch")) {
                errorMessage =
                    "Não foi possível conectar à Inteligência Artificial. Verifique se o Ollama está em execução (ollama run llama3.2:3b).";
            }

            addErrorMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    function clearMessages() {
        tracer.clear();
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
