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
import { Activity } from "lucide-react";
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

function InnerGraph({ steps, isRunning }: ExecutionGraphProps) {
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
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50/50">
            {isRunning && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-xs">
                    <Activity size={12} className="animate-spin text-slate-900" />
                    <span>Processando fluxo...</span>
                </div>
            )}

            <div className="flex-1 w-full h-full">
                {steps.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-slate-400">
                        Nenhuma execução registrada.
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
                        <Controls showInteractive={false} className="bg-white! border-slate-200! shadow-sm!" />
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
