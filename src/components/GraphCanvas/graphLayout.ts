import { MarkerType, type Edge, type Node } from "@xyflow/react";
import type { TracerStepUpdate } from "../../services/ai/tracer";
import type { PipelineNodeData } from "./CustomNodes";

const LEVEL_X_OFFSET = 320;
const NODE_HEIGHT = 100;
const VERTICAL_GAP = 30;

export function buildGraphFromSteps(
    steps: TracerStepUpdate[],
    onSelectNode: (data: PipelineNodeData) => void,
): { nodes: Node[]; edges: Edge[] } {
    if (steps.length === 0) {
        return { nodes: [], edges: [] };
    }

    const stepMap = new Map<string, TracerStepUpdate>(steps.map((s) => [s.id, s]));

    const childrenMap = new Map<string, string[]>();
    steps.forEach((s) => {
        if (s.parentId) {
            const arr = childrenMap.get(s.parentId) || [];
            arr.push(s.id);
            childrenMap.set(s.parentId, arr);
        }
    });

    const levelMap = new Map<string, number>();

    function getLevel(id: string): number {
        if (levelMap.has(id)) return levelMap.get(id)!;
        const step = stepMap.get(id);
        if (!step || !step.parentId) {
            levelMap.set(id, 0);
            return 0;
        }
        const lvl = getLevel(step.parentId) + 1;
        levelMap.set(id, lvl);
        return lvl;
    }

    steps.forEach((s) => getLevel(s.id));

    const nodesByLevel = new Map<number, TracerStepUpdate[]>();
    steps.forEach((s) => {
        const lvl = levelMap.get(s.id) || 0;
        const list = nodesByLevel.get(lvl) || [];
        list.push(s);
        nodesByLevel.set(lvl, list);
    });

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const centerY = 160;

    nodesByLevel.forEach((levelSteps, lvl) => {
        const totalHeight = levelSteps.length * NODE_HEIGHT + (levelSteps.length - 1) * VERTICAL_GAP;
        const startY = centerY - totalHeight / 2 + NODE_HEIGHT / 2;

        levelSteps.forEach((step, index) => {
            const x = 50 + lvl * LEVEL_X_OFFSET;
            const y = startY + index * (NODE_HEIGHT + VERTICAL_GAP);

            nodes.push({
                id: step.id,
                type: "pipelineNode",
                position: { x, y },
                data: {
                    label: step.label || step.id,
                    sublabel: step.sublabel,
                    stepType: step.stepType || "llm_decision",
                    status: step.status,
                    durationMs: step.durationMs,
                    iconType: step.iconType,
                    metadata: step.metadata,
                    onSelect: onSelectNode,
                } satisfies PipelineNodeData,
            });

            if (step.parentId && stepMap.has(step.parentId)) {
                const parent = stepMap.get(step.parentId)!;
                const isAnimated = step.status === "running" || parent.status === "running";
                const isSuccess = step.status === "success";

                edges.push({
                    id: `edge-${step.parentId}-${step.id}`,
                    source: step.parentId,
                    target: step.id,
                    type: "smoothstep",
                    animated: isAnimated,
                    style: {
                        stroke: isAnimated ? "#3b82f6" : isSuccess ? "#10b981" : "#94a3b8",
                        strokeWidth: isAnimated ? 2.5 : 2,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isAnimated ? "#3b82f6" : isSuccess ? "#10b981" : "#94a3b8",
                    },
                });
            }
        });
    });

    return { nodes, edges };
}
