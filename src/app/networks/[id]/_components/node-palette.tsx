"use client";

import { cn } from "@/lib/utils";
import { NODE_META } from "@/lib/node-meta";
import { NODE_TYPES, type NodeType } from "@/types/network";

interface NodePaletteProps {
  onAdd: (type: NodeType) => void;
}

export function NodePalette({ onAdd }: NodePaletteProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-line bg-surface p-3">
      <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Add node
      </p>
      {NODE_TYPES.map((type) => {
        const meta = NODE_META[type];
        const Icon = meta.icon;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/axn-node-type", type);
              event.dataTransfer.effectAllowed = "move";
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-line bg-surface-muted p-2.5 text-left",
              "transition-colors hover:border-line-strong hover:bg-surface",
            )}
          >
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", meta.solidClass)}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ink">{meta.label}</span>
              <span className="block truncate text-[11px] leading-tight text-ink-faint">
                {meta.description}
              </span>
            </span>
          </button>
        );
      })}
      <p className="mt-2 px-1 text-[11px] leading-relaxed text-ink-faint">
        Click or drag a type onto the canvas, then draw an edge from a node&apos;s right handle to
        another&apos;s left handle.
      </p>
    </aside>
  );
}
