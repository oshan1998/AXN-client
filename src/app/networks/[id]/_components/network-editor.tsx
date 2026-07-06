"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Play, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useNetwork, useUpdateNetwork } from "@/hooks/use-networks";
import {
  fromFlowGraph,
  nextNodeId,
  toFlowGraph,
  type GraphNode,
} from "@/lib/graph";
import { NODE_META } from "@/lib/node-meta";
import { NODE_TYPES, type Network, type NodeType } from "@/types/network";
import { ConfigPanel } from "./config-panel";
import { GraphNodeCard } from "./graph-node";
import { NodePalette } from "./node-palette";
import { TestRunDialog } from "./test-run-dialog";

const nodeTypes = { axn: GraphNodeCard };

export function NetworkEditorLoader({ id }: { id: string }) {
  const { data: network, isPending, isError, error } = useNetwork(id);

  if (isPending) {
    return <div className="m-6 flex-1 animate-pulse rounded-2xl bg-surface" />;
  }
  if (isError) {
    return (
      <EmptyState
        icon={Workflow}
        title="Couldn't load this network"
        description={error.message}
        action={
          <Button variant="secondary" size="sm">
            <Link href="/networks">Back to networks</Link>
          </Button>
        }
      />
    );
  }
  return (
    <ReactFlowProvider>
      <NetworkEditor key={network._id} network={network} />
    </ReactFlowProvider>
  );
}

function NetworkEditor({ network }: { network: Network }) {
  const initial = useMemo(
    () => toFlowGraph(network.nodes, network.edges, network.entryNodeId),
    [network],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [entryNodeId, setEntryNodeId] = useState(network.entryNodeId);
  const [meta, setMeta] = useState({ name: network.name, description: network.description ?? "" });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [testRunOpen, setTestRunOpen] = useState(false);

  const { screenToFlowPosition } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const updateNetwork = useUpdateNetwork(network._id);

  // isEntry lives in node data so the canvas card can render the badge.
  const displayNodes = useMemo(
    () =>
      nodes.map((node) =>
        node.data.isEntry === (node.id === entryNodeId)
          ? node
          : { ...node, data: { ...node.data, isEntry: node.id === entryNodeId } },
      ),
    [nodes, entryNodeId],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<GraphNode>[]) => {
      if (changes.some((change) => change.type === "position" || change.type === "remove")) {
        setDirty(true);
      }
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      if (changes.some((change) => change.type === "remove")) {
        setDirty(true);
      }
      onEdgesChange(changes);
    },
    [onEdgesChange],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => addEdge(connection, current));
      setDirty(true);
    },
    [setEdges],
  );

  const addNode = useCallback(
    (type: NodeType, position?: { x: number; y: number }) => {
      setNodes((current) => {
        const id = nextNodeId(type, current);
        const node: GraphNode = {
          id,
          type: "axn",
          position: position ?? { x: 160 + current.length * 40, y: 140 + current.length * 30 },
          data: { nodeType: type, config: { name: NODE_META[type].label }, isEntry: false },
        };
        return [...current, node];
      });
      setDirty(true);
    },
    [setNodes],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      const type = event.dataTransfer.getData("application/axn-node-type") as NodeType | "";
      if (!type || !NODE_TYPES.includes(type)) return;
      event.preventDefault();
      addNode(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
    },
    [addNode, screenToFlowPosition],
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, patch: Record<string, unknown>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config: { ...node.data.config, ...patch } } }
            : node,
        ),
      );
      setDirty(true);
    },
    [setNodes],
  );

  const updateEdgeCondition = useCallback(
    (edgeId: string, condition: string) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === edgeId ? { ...edge, label: condition || undefined } : edge,
        ),
      );
      setDirty(true);
    },
    [setEdges],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      );
      setSelectedNodeId(null);
      setDirty(true);
    },
    [setNodes, setEdges],
  );

  const save = () => {
    const graph = fromFlowGraph(nodes, edges);
    updateNetwork.mutate(
      {
        name: meta.name,
        description: meta.description || undefined,
        entryNodeId,
        ...graph,
      },
      { onSuccess: () => setDirty(false) },
    );
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
        <Button variant="ghost" size="sm" className="size-8 p-0" aria-label="Back to networks">
          <Link href="/networks" className="flex size-full items-center justify-center">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold">{meta.name}</h1>
            {dirty ? <Badge tone="warning">Unsaved</Badge> : <Badge tone="success">Saved</Badge>}
          </div>
          <p className="text-xs text-ink-faint">
            {nodes.length} node{nodes.length === 1 ? "" : "s"} · entry:{" "}
            {(nodes.find((node) => node.id === entryNodeId)?.data.config.name as string) ??
              entryNodeId}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setTestRunOpen(true)}>
            <Play className="size-3.5" />
            Test run
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty || updateNetwork.isPending}>
            {updateNetwork.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      {updateNetwork.isError ? (
        <p className="border-b border-danger/20 bg-danger-soft px-4 py-2 text-[13px] text-danger">
          Save failed: {updateNetwork.error.message}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <NodePalette onAdd={addNode} />

        <div ref={canvasRef} className="min-w-0 flex-1" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            fitViewOptions={{ maxZoom: 1, padding: 0.25 }}
            deleteKeyCode={["Backspace", "Delete"]}
            className="bg-surface-muted"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--color-line-strong)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <ConfigPanel
          node={selectedNode}
          meta={meta}
          onMetaChange={(patch) => {
            setMeta((current) => ({ ...current, ...patch }));
            setDirty(true);
          }}
          isEntry={selectedNode?.id === entryNodeId}
          outgoingEdges={edges.filter((edge) => edge.source === selectedNodeId)}
          incomingEdgeCount={edges.filter((edge) => edge.target === selectedNodeId).length}
          nodeNames={Object.fromEntries(
            nodes.map((node) => [node.id, (node.data.config.name as string) || node.id]),
          )}
          onConfigChange={updateNodeConfig}
          onEdgeConditionChange={updateEdgeCondition}
          onSetEntry={(nodeId) => {
            setEntryNodeId(nodeId);
            setDirty(true);
          }}
          onDelete={deleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      <TestRunDialog
        open={testRunOpen}
        onClose={() => setTestRunOpen(false)}
        networkId={network._id}
        networkName={meta.name}
        hasUnsavedChanges={dirty}
      />
    </div>
  );
}
