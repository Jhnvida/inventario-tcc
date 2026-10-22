export type StepStatus = "waiting" | "running" | "success" | "error";

export type StepType =
    | "user_input"
    | "llm_decision"
    | "tool_call"
    | "db_query"
    | "computation"
    | "llm_synthesis"
    | "output";

export type IconType = "user" | "bot" | "tool" | "database" | "calculator" | "check" | "alert";

export interface TracerStepUpdate {
    id: string;
    parentId?: string;
    stepType?: StepType;
    label?: string;
    sublabel?: string;
    status: StepStatus;
    durationMs?: number;
    metadata?: Record<string, any>;
    iconType?: IconType;
}

export type TracerEvent =
    | { type: "start_trace"; prompt: string }
    | { type: "step_update"; step: TracerStepUpdate }
    | { type: "finish_trace"; success: boolean; totalDurationMs?: number }
    | { type: "clear_trace" };

type TracerListener = (event: TracerEvent) => void;

class ExecutionTracer {
    private listeners: Set<TracerListener> = new Set();

    subscribe(listener: TracerListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    emit(event: TracerEvent): void {
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            } catch (err) {
                console.error("Erro no listener do tracer:", err);
            }
        });
    }

    startTrace(prompt: string) {
        this.emit({ type: "start_trace", prompt });
    }

    updateStep(step: TracerStepUpdate) {
        this.emit({ type: "step_update", step });
    }

    finishTrace(success = true, totalDurationMs?: number) {
        this.emit({ type: "finish_trace", success, totalDurationMs });
    }

    clear() {
        this.emit({ type: "clear_trace" });
    }
}

export const tracer = new ExecutionTracer();
