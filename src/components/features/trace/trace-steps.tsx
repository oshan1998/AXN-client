import { cn } from "@/lib/utils";
import { NODE_META } from "@/lib/node-meta";
import type { NetworkTraceStep } from "@/types/network";

interface TraceStepsProps {
  steps: NetworkTraceStep[];
  /** Renders a pulsing "running" placeholder after the last step. */
  running?: boolean;
  /** nodeId → display name lookup; falls back to the raw nodeId. */
  nodeNames?: Record<string, string>;
  className?: string;
}

/** Vertical list of node hops, color-coded by node type — the trace language. */
export function TraceSteps({ steps, running, nodeNames, className }: TraceStepsProps) {
  return (
    <ol className={cn("space-y-0.5", className)}>
      {steps.map((step, index) => {
        const meta = NODE_META[step.type];
        const Icon = meta.icon;
        return (
          <li key={`${step.nodeId}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", meta.solidClass)}>
                <Icon className="size-3.5" />
              </span>
              {index < steps.length - 1 || running ? (
                <span className="w-px flex-1 bg-line" />
              ) : null}
            </div>
            <div className="min-w-0 pb-4">
              <p className="text-[13px] font-medium leading-6 text-ink">
                {nodeNames?.[step.nodeId] ?? step.nodeId}
              </p>
              <p className="text-xs text-ink-faint">
                {meta.label}
                {step.branch ? (
                  <>
                    {" · branch "}
                    <span className="rounded bg-surface-muted px-1 py-0.5 font-medium text-ink-muted">
                      {step.branch}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </li>
        );
      })}

      {running ? (
        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-line-strong" />
          <p className="text-[13px] leading-6 text-ink-faint">Running…</p>
        </li>
      ) : null}
    </ol>
  );
}
