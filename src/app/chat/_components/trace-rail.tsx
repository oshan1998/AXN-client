"use client";

import { Activity, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NetworkTraceTree } from "@/components/features/trace/network-trace-tree";
import type { NetworkStepUi, RealtimeStatus } from "@/types/trace";

interface TraceRailProps {
  steps: NetworkStepUi[];
  running: boolean;
  nodeNames: Record<string, string>;
  connectionStatus?: RealtimeStatus;
  onCancel?: () => void;
  cancelling?: boolean;
}

function connectionLabel(status: RealtimeStatus | undefined, running: boolean): string {
  if (!running) {
    return "Idle";
  }
  switch (status) {
    case "open":
      return "Live";
    case "connecting":
      return "Connecting";
    case "closed":
      return "Reconnecting";
    default:
      return "Running";
  }
}

/** Right-hand rail showing live node hops and nested agent steps for the active run. */
export function TraceRail({
  steps,
  running,
  nodeNames,
  connectionStatus,
  onCancel,
  cancelling = false,
}: TraceRailProps) {
  const live = running && connectionStatus === "open";

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-line bg-surface xl:flex">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Activity className="size-4 text-ink-muted" />
        <h2 className="text-[13px] font-semibold">Run trace</h2>
        <span
          className={cn(
            "ml-auto size-2 rounded-full",
            live ? "animate-pulse bg-success" : running ? "bg-warning" : "bg-line-strong",
          )}
          title={connectionLabel(connectionStatus, running)}
        />
        {running ? (
          <span className="text-[11px] text-ink-faint">
            {connectionLabel(connectionStatus, running)}
          </span>
        ) : null}
        {running && onCancel ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={cancelling}
            className="h-7 px-2 text-[11px] text-danger hover:text-danger"
            aria-label="Stop run"
          >
            <Square className="size-3 fill-current" />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {steps.length === 0 && !running ? (
          <p className="text-[13px] leading-relaxed text-ink-faint">
            Node hops and agent tool calls for the latest run show up here in real time.
          </p>
        ) : (
          <NetworkTraceTree steps={steps} running={running} nodeNames={nodeNames} />
        )}
      </div>
    </aside>
  );
}
