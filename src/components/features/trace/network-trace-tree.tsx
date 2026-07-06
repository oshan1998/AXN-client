import { cn } from "@/lib/utils";
import { NODE_META } from "@/lib/node-meta";
import { AgentTraceSteps } from "./agent-trace-steps";
import type { NetworkStepUi } from "@/types/trace";

interface NetworkTraceTreeProps {
  steps: NetworkStepUi[];
  running?: boolean;
  nodeNames?: Record<string, string>;
  className?: string;
}

/** Live network hops with nested agent reasoning steps. */
export function NetworkTraceTree({
  steps,
  running,
  nodeNames,
  className,
}: NetworkTraceTreeProps) {
  return (
    <ol className={cn("space-y-0.5", className)}>
      {steps.map((step, index) => {
        const meta = NODE_META[step.nodeType];
        const Icon = meta.icon;
        const isActive = step.status === "active";

        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  isActive ? "ring-2 ring-success/40 ring-offset-1" : "",
                  meta.solidClass,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {index < steps.length - 1 || running ? (
                <span className="w-px flex-1 bg-line" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <p className="text-[13px] font-medium leading-6 text-ink">
                {nodeNames?.[step.nodeId] ?? step.nodeId}
                {isActive ? (
                  <span className="ml-2 text-xs font-normal text-success">running</span>
                ) : null}
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
              {step.nodeType === "agent" ? (
                <AgentTraceSteps steps={step.agentSteps} />
              ) : null}
            </div>
          </li>
        );
      })}

      {running && steps.every((step) => step.status !== "active") ? (
        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-line-strong" />
          <p className="text-[13px] leading-6 text-ink-faint">Starting run…</p>
        </li>
      ) : null}
    </ol>
  );
}
