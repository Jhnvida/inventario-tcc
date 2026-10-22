import { Handle, Position } from "@xyflow/react";
import { AlertCircle, Bot, Calculator, CheckCircle2, Database, Loader2, User, Wrench } from "lucide-react";
import React from "react";
import type { IconType, StepStatus, StepType } from "../../services/ai/tracer";

export interface PipelineNodeData {
    label: string;
    sublabel?: string;
    stepType: StepType;
    status: StepStatus;
    durationMs?: number;
    iconType?: IconType;
    metadata?: Record<string, any>;
    onSelect?: (data: PipelineNodeData) => void;
}

const iconMap: Record<IconType, React.ComponentType<{ className?: string; size?: number }>> = {
    user: User,
    bot: Bot,
    tool: Wrench,
    database: Database,
    calculator: Calculator,
    check: CheckCircle2,
    alert: AlertCircle,
};

const badgeStyles: Record<StepType, { bg: string; text: string; border: string }> = {
    user_input: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
    llm_decision: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-300" },
    tool_call: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
    db_query: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
    computation: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-300" },
    llm_synthesis: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300" },
    output: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-300" },
};

export const stepTypeLabels: Record<StepType, string> = {
    user_input: "Entrada do Usuário",
    llm_decision: "Avaliação da IA",
    tool_call: "Ferramenta",
    db_query: "Consulta ao Banco",
    computation: "Processamento",
    llm_synthesis: "Síntese da Resposta",
    output: "Resposta Final",
};

export function PipelineNode({ data }: { data: PipelineNodeData }) {
    const nodeData = data as PipelineNodeData;
    const { label, sublabel, stepType, status, durationMs, iconType = "bot", onSelect } = nodeData;

    const Icon = iconMap[iconType] || Bot;
    const badge = badgeStyles[stepType] || badgeStyles.llm_decision;

    const isRunning = status === "running";
    const isSuccess = status === "success";
    const isError = status === "error";

    return (
        <div
            onClick={() => onSelect?.(nodeData)}
            className={`group relative flex w-64 flex-col rounded-xl border bg-white p-3.5 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                isRunning
                    ? "border-blue-500 ring-2 ring-blue-400/50 shadow-blue-500/10 animate-pulse"
                    : isSuccess
                      ? "border-emerald-400 hover:border-emerald-500"
                      : isError
                        ? "border-red-400 hover:border-red-500"
                        : "border-slate-200 hover:border-slate-300 opacity-60"
            }`}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="h-3! w-3! -left-1.5! border-2! border-white! bg-slate-400! transition-colors group-hover:bg-blue-500!"
            />

            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                    <Icon size={14} className={badge.text} />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                        {stepTypeLabels[stepType] || stepType}
                    </span>
                </div>

                <div>
                    {isRunning && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <Loader2 size={11} className="animate-spin" />
                            <span>executando</span>
                        </span>
                    )}
                    {isSuccess && durationMs !== undefined && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {durationMs}ms
                        </span>
                    )}
                    {isSuccess && durationMs === undefined && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            concluído
                        </span>
                    )}
                    {isError && (
                        <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            falha
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{label}</h4>
                {sublabel && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-mono bg-slate-50 p-1 rounded border border-slate-100">
                        {sublabel}
                    </p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="h-3! w-3! -right-1.5! border-2! border-white! bg-slate-400! transition-colors group-hover:bg-blue-500!"
            />
        </div>
    );
}
