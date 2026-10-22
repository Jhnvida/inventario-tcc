import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Edge,
    type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Activity, Clock, Maximize2, Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import type { TracerStepUpdate } from "../../services/ai/tracer";
import { PipelineNode, type PipelineNodeData } from "./CustomNodes";
import { buildGraphFromSteps } from "./graphLayout";
import { NodeInspectorModal } from "./NodeInspectorModal";

const nodeTypes = {
    pipelineNode: PipelineNode,
};

interface ExecutionGraphProps {
    steps: TracerStepUpdate[];
    isRunning: boolean;
    totalDurationMs?: number;
    prompt?: string;
    onClear?: () => void;
}

function InnerGraph({ steps, isRunning, totalDurationMs, prompt, onClear }: ExecutionGraphProps) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<PipelineNodeData | null>(null);

    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = buildGraphFromSteps(steps, (nodeData) => {
            setSelectedNode(nodeData);
        });

        setNodes(newNodes);
        setEdges(newEdges);

        const timer = setTimeout(() => {
            fitView({ padding: 0.25, duration: 400 });
        }, 100);

        return () => clearTimeout(timer);
    }, [steps, fitView, setNodes, setEdges]);

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-900/5">
            <div className="z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
                        <Workflow size={13} />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-800">Grafo de Raciocínio & Execução</span>
                        {prompt && (
                            <span className="ml-2 hidden text-[11px] text-slate-500 sm:inline truncate max-w-xs">
                                ({prompt})
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isRunning ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 animate-pulse">
                            <Activity size={12} className="animate-spin" />
                            <span>Pipeline ativo</span>
                        </span>
                    ) : totalDurationMs !== undefined && steps.length > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                            <Clock size={11} />
                            <span>{totalDurationMs} ms total</span>
                        </span>
                    ) : null}

                    {steps.length > 0 && (
                        <button
                            type="button"
                            onClick={() => fitView({ padding: 0.25, duration: 300 })}
                            title="Ajustar visualização"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            <Maximize2 size={13} />
                        </button>
                    )}

                    {steps.length > 0 && onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full h-full">
                {steps.length === 0 ? (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-xs mb-3">
                            <Workflow size={24} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700">Aguardando execução da IA</h4>
                        <p className="mt-1 max-w-xs text-xs text-slate-500">
                            Faça uma pergunta no chat para acompanhar o fluxo de decisão do Llama 3.2 e as consultas ao
                            banco em tempo real.
                        </p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes as any}
                        fitView
                        fitViewOptions={{ padding: 0.25 }}
                        minZoom={0.2}
                        maxZoom={1.5}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
                        <Controls showInteractive={false} className="!bg-white !border-slate-200 !shadow-sm" />
                    </ReactFlow>
                )}
            </div>

            <NodeInspectorModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
    );
}

export function ExecutionGraph(props: ExecutionGraphProps) {
    return (
        <ReactFlowProvider>
            <InnerGraph {...props} />
        </ReactFlowProvider>
    );
}
