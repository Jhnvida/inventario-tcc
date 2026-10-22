import { Clock, Code2, Database, X } from "lucide-react";
import type { PipelineNodeData } from "./CustomNodes";

interface NodeInspectorModalProps {
    nodeData: PipelineNodeData | null;
    onClose: () => void;
}

export function NodeInspectorModal({ nodeData, onClose }: NodeInspectorModalProps) {
    if (!nodeData) return null;

    const { label, sublabel, stepType, status, durationMs, metadata } = nodeData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <Code2 size={15} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                                Tipo: {stepType}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <span className="text-[11px] text-slate-500 font-medium block mb-1">Status</span>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                    status === "success"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : status === "running"
                                          ? "bg-blue-100 text-blue-800"
                                          : status === "error"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-slate-200 text-slate-700"
                                }`}
                            >
                                {status.toUpperCase()}
                            </span>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <span className="text-[11px] text-slate-500 font-medium block mb-1">Tempo de Execução</span>
                            <div className="flex items-center gap-1.5 font-mono text-slate-700 font-medium">
                                <Clock size={13} className="text-slate-400" />
                                <span>{durationMs !== undefined ? `${durationMs} ms` : "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {sublabel && (
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                                Resumo da Execução
                            </span>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-slate-700 leading-relaxed">
                                {sublabel}
                            </div>
                        </div>
                    )}

                    {metadata && Object.keys(metadata).length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Database size={13} className="text-slate-500" />
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    Payload / Parâmetros Técnicos (JSON)
                                </span>
                            </div>
                            <pre className="max-h-60 overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-[11px] text-emerald-400 leading-relaxed">
                                {JSON.stringify(metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-right">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
