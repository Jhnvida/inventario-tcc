import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tracer, type TracerStepUpdate } from "../services/ai/tracer";

interface ExecutionGraphContextType {
    steps: TracerStepUpdate[];
    isRunning: boolean;
    currentPrompt: string;
    totalDurationMs?: number;
    isGraphOpen: boolean;
    setIsGraphOpen: (open: boolean) => void;
    toggleGraph: () => void;
    clearGraph: () => void;
}

const ExecutionGraphContext = createContext<ExecutionGraphContextType | null>(null);

export function ExecutionGraphProvider({ children }: { children: ReactNode }) {
    const [steps, setSteps] = useState<TracerStepUpdate[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [totalDurationMs, setTotalDurationMs] = useState<number | undefined>(undefined);
    const [isGraphOpen, setIsGraphOpen] = useState(true);

    useEffect(() => {
        const unsubscribe = tracer.subscribe((event) => {
            if (event.type === "start_trace") {
                setSteps([]);
                setIsRunning(true);
                setCurrentPrompt(event.prompt);
                setTotalDurationMs(undefined);
            } else if (event.type === "step_update") {
                setSteps((prev) => {
                    const idx = prev.findIndex((s) => s.id === event.step.id);
                    if (idx >= 0) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], ...event.step };
                        return updated;
                    } else {
                        return [...prev, event.step];
                    }
                });
            } else if (event.type === "finish_trace") {
                setIsRunning(false);
                if (event.totalDurationMs !== undefined) {
                    setTotalDurationMs(event.totalDurationMs);
                }
            } else if (event.type === "clear_trace") {
                setSteps([]);
                setIsRunning(false);
                setCurrentPrompt("");
                setTotalDurationMs(undefined);
            }
        });

        return unsubscribe;
    }, []);

    function toggleGraph() {
        setIsGraphOpen((prev) => !prev);
    }

    function clearGraph() {
        tracer.clear();
    }

    return (
        <ExecutionGraphContext.Provider
            value={{
                steps,
                isRunning,
                currentPrompt,
                totalDurationMs,
                isGraphOpen,
                setIsGraphOpen,
                toggleGraph,
                clearGraph,
            }}
        >
            {children}
        </ExecutionGraphContext.Provider>
    );
}

export function useExecutionGraph() {
    const ctx = useContext(ExecutionGraphContext);
    if (!ctx) {
        throw new Error("useExecutionGraph deve ser usado dentro de um ExecutionGraphProvider");
    }
    return ctx;
}
