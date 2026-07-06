"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { GraphNode } from "@/lib/graph";
import { NODE_META, PROVIDER_LABELS, ROUTER_TYPE_LABELS } from "@/lib/node-meta";
import type {
  AgentNodeConfig,
  ClassifierNodeConfig,
  LlmProvider,
  RagNodeConfig,
  RouterNodeConfig,
  RouterType,
} from "@/types/network";

function subtitleFor(data: GraphNode["data"]): string {
  const config = data.config;
  switch (data.nodeType) {
    case "agent": {
      const { provider, model } = config as AgentNodeConfig;
      if (!provider && !model) return "default provider";
      return [provider ? PROVIDER_LABELS[provider as LlmProvider] : null, model]
        .filter(Boolean)
        .join(" · ");
    }
    case "router": {
      const { routerType = "single", rules } = config as RouterNodeConfig;
      const ruleCount = Object.keys(rules ?? {}).length;
      const kind = ROUTER_TYPE_LABELS[routerType as RouterType].toLowerCase();
      return routerType === "single"
        ? `${kind} · ${ruleCount} rule${ruleCount === 1 ? "" : "s"}`
        : kind;
    }
    case "rag": {
      const { corpusId, topK } = config as RagNodeConfig;
      return corpusId ? `${corpusId}${topK ? ` · top ${topK}` : ""}` : "no corpus linked";
    }
    case "classifier": {
      const { labels } = config as ClassifierNodeConfig;
      const count = labels?.length ?? 0;
      return `${count} label${count === 1 ? "" : "s"}`;
    }
  }
}

export const GraphNodeCard = memo(function GraphNodeCard({
  data,
  selected,
}: NodeProps<GraphNode>) {
  const meta = NODE_META[data.nodeType];
  const Icon = meta.icon;
  const name = (data.config.name as string | undefined) || meta.label;

  return (
    <div
      className={cn(
        "relative w-48 rounded-xl border bg-surface px-3 py-2.5 shadow-card transition-shadow",
        selected ? cn("border-2 shadow-panel", meta.ringClass) : "border-line-strong",
      )}
    >
      {data.isEntry ? (
        <span className="absolute -top-2.5 left-2.5 rounded bg-rail px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
          ENTRY
        </span>
      ) : null}

      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", meta.solidClass)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-ink">{name}</p>
          <p className="truncate text-[11px] text-ink-faint">{subtitleFor(data)}</p>
        </div>
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
