"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useCapabilities } from "@/hooks/use-capabilities";

export function SkillsView() {
  const { data: capabilities, isPending, isError, error } = useCapabilities();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Registered skills</h2>
        <p className="text-[13px] text-ink-muted">
          Higher-level procedures agents can invoke — loaded from the backend&apos;s skills
          directory.
        </p>
      </div>

      {isPending ? (
        <p className="text-[13px] text-ink-faint">Loading skills…</p>
      ) : isError || !capabilities ? (
        <EmptyState
          icon={Sparkles}
          title="Couldn't reach the AXN backend"
          description={error?.message ?? "Failed to load registered skills."}
        />
      ) : capabilities.skills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No skills registered"
          description="Skills scanned from the backend's skills/ directory appear here. A workflow skill runs fixed steps; an agentic skill hands instructions to a sub-agent."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {capabilities.skills.map((skill, index) => (
            <div
              key={skill.name}
              className={index > 0 ? "border-t border-line px-4 py-3" : "px-4 py-3"}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-medium text-ink">{skill.name}</span>
                <Badge tone={skill.kind === "workflow" ? "accent" : "success"}>
                  {skill.kind === "workflow" ? "Workflow" : "Agentic"}
                </Badge>
              </div>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                {skill.description || "No description"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
