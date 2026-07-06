import type { Edge, Node } from "@xyflow/react";
import type { NetworkEdge, NetworkNode, NodeType } from "@/types/network";

/** Payload carried by every canvas node; `nodeId` is the React Flow node id. */
export interface GraphNodeData extends Record<string, unknown> {
  nodeType: NodeType;
  config: Record<string, unknown>;
  isEntry: boolean;
}

export type GraphNode = Node<GraphNodeData, "axn">;

const FALLBACK_SPACING = { x: 260, y: 140, originX: 120, originY: 120 };

function fallbackPosition(index: number) {
  return {
    x: FALLBACK_SPACING.originX + Math.floor(index / 2) * FALLBACK_SPACING.x,
    y: FALLBACK_SPACING.originY + (index % 2) * FALLBACK_SPACING.y,
  };
}

export function toFlowGraph(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  entryNodeId: string,
): { nodes: GraphNode[]; edges: Edge[] } {
  return {
    nodes: nodes.map((node, index) => ({
      id: node.nodeId,
      type: "axn" as const,
      position: node.config?.position ?? fallbackPosition(index),
      data: {
        nodeType: node.type,
        config: node.config ?? {},
        isEntry: node.nodeId === entryNodeId,
      },
    })),
    edges: edges.map((edge) => ({
      id: `e-${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.condition,
    })),
  };
}

export function fromFlowGraph(
  nodes: GraphNode[],
  edges: Edge[],
): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  return {
    nodes: nodes.map((node) => ({
      nodeId: node.id,
      type: node.data.nodeType,
      config: { ...node.data.config, position: node.position },
    })),
    edges: edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
      condition: typeof edge.label === "string" && edge.label ? edge.label : undefined,
    })),
  };
}

/** Generates the next free id for a type, e.g. "router-2". */
export function nextNodeId(type: NodeType, existing: { id: string }[]): string {
  const taken = new Set(existing.map((node) => node.id));
  let index = 1;
  while (taken.has(`${type}-${index}`)) {
    index += 1;
  }
  return `${type}-${index}`;
}
