"use client";

import type { Edge } from "@xyflow/react";
import { Crosshair, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GraphNode } from "@/lib/graph";
import { NODE_META } from "@/lib/node-meta";
import { AgentConfigForm } from "./agent-config";
import { ClassifierConfigForm } from "./classifier-config";
import { RagConfigForm } from "./rag-config";
import { RouterConfigForm } from "./router-config";

export interface NodeConfigFormProps {
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  outgoingEdges: Edge[];
  incomingEdgeCount: number;
  /** nodeId → display name, for readable edge target labels. */
  nodeNames: Record<string, string>;
  onEdgeConditionChange: (edgeId: string, condition: string) => void;
}

interface ConfigPanelProps {
  node: GraphNode | null;
  meta: { name: string; description: string };
  onMetaChange: (patch: Partial<{ name: string; description: string }>) => void;
  isEntry: boolean;
  outgoingEdges: Edge[];
  incomingEdgeCount: number;
  nodeNames: Record<string, string>;
  onConfigChange: (nodeId: string, patch: Record<string, unknown>) => void;
  onEdgeConditionChange: (edgeId: string, condition: string) => void;
  onSetEntry: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function ConfigPanel(props: ConfigPanelProps) {
  const { node } = props;

  return (
    <aside className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-l border-line bg-surface">
      {node ? <NodePanel {...props} node={node} /> : <NetworkPanel {...props} />}
    </aside>
  );
}

function NetworkPanel({ meta, onMetaChange }: ConfigPanelProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="border-b border-line pb-3">
        <h2 className="text-sm font-semibold">Network</h2>
        <p className="mt-0.5 text-xs text-ink-faint">Select a node to edit its configuration.</p>
      </div>
      <Field label="Name">
        <Input value={meta.name} onChange={(event) => onMetaChange({ name: event.target.value })} />
      </Field>
      <Field label="Description">
        <Textarea
          value={meta.description}
          onChange={(event) => onMetaChange({ description: event.target.value })}
          placeholder="What this network is for"
        />
      </Field>
    </div>
  );
}

function NodePanel(props: ConfigPanelProps & { node: GraphNode }) {
  const { node, isEntry, onConfigChange, onSetEntry, onDelete, onClose } = props;
  const meta = NODE_META[node.data.nodeType];
  const Icon = meta.icon;

  const formProps: NodeConfigFormProps = {
    config: node.data.config,
    onChange: (patch) => onConfigChange(node.id, patch),
    outgoingEdges: props.outgoingEdges,
    incomingEdgeCount: props.incomingEdgeCount,
    nodeNames: props.nodeNames,
    onEdgeConditionChange: props.onEdgeConditionChange,
  };

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-line p-4">
        <span className={cn("flex size-7 items-center justify-center rounded-lg", meta.solidClass)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{meta.label} node</h2>
          <p className="truncate text-xs text-ink-faint">{node.id}</p>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto size-8 p-0" onClick={onClose} aria-label="Close panel">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 p-4" key={node.id}>
        <Field label="Node name">
          <Input
            value={(node.data.config.name as string) ?? ""}
            onChange={(event) => onConfigChange(node.id, { name: event.target.value })}
            placeholder={meta.label}
          />
        </Field>

        {node.data.nodeType === "agent" ? <AgentConfigForm {...formProps} /> : null}
        {node.data.nodeType === "router" ? <RouterConfigForm {...formProps} /> : null}
        {node.data.nodeType === "rag" ? <RagConfigForm {...formProps} /> : null}
        {node.data.nodeType === "classifier" ? <ClassifierConfigForm {...formProps} /> : null}
      </div>

      <div className="flex items-center gap-2 border-t border-line p-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetEntry(node.id)}
          disabled={isEntry}
        >
          <Crosshair className="size-3.5" />
          {isEntry ? "Entry node" : "Set as entry"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="ml-auto"
          onClick={() => onDelete(node.id)}
          disabled={isEntry}
          title={isEntry ? "Reassign the entry point before deleting this node" : undefined}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </>
  );
}
