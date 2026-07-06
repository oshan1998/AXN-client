import { cn } from "@/lib/utils";
import type { ReasoningStepUi } from "@/types/trace";

interface AgentTraceStepsProps {
  steps: ReasoningStepUi[];
  className?: string;
}

/** Nested reasoning steps shown under an agent network hop. */
export function AgentTraceSteps({ steps, className }: AgentTraceStepsProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <ol className={cn("ml-2 mt-1 space-y-1 border-l border-line pl-3", className)}>
      {steps.map((step) => (
        <li key={step.id} className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                step.status === "active"
                  ? "animate-pulse bg-success"
                  : step.status === "error"
                    ? "bg-danger"
                    : step.status === "complete"
                      ? "bg-line-strong"
                      : "bg-line",
              )}
            />
            <p
              className={cn(
                "text-xs font-medium",
                step.status === "error" ? "text-danger" : "text-ink-muted",
              )}
            >
              {step.label}
            </p>
          </div>
          {step.description ? (
            <p className="mt-0.5 pl-3.5 text-[11px] leading-relaxed text-ink-faint">
              {step.description}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
