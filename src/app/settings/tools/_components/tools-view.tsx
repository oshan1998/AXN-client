"use client";

import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useCapabilities } from "@/hooks/use-capabilities";

export function ToolsView() {
  const { data: capabilities, isPending, isError, error } = useCapabilities();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Registered tools</h2>
        <p className="text-[13px] text-ink-muted">
          Functions agents can call, grouped by MCP server — core tools plus anything loaded from
          mcp.config.json.
        </p>
      </div>

      {isPending ? (
        <p className="text-[13px] text-ink-faint">Loading tools…</p>
      ) : isError || !capabilities ? (
        <EmptyState
          icon={Wrench}
          title="Couldn't reach the AXN backend"
          description={error?.message ?? "Failed to load registered tools."}
        />
      ) : capabilities.toolServers.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No tools registered"
          description="Core tools and MCP-server tools appear here once the backend loads them."
        />
      ) : (
        <div className="space-y-4">
          {capabilities.toolServers.map((server) => (
            <div
              key={server.serverName}
              className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
            >
              <div className="flex items-center gap-2 border-b border-line bg-surface-muted px-4 py-2.5">
                <span className="text-[13px] font-semibold text-ink">{server.serverName}</span>
                <Badge tone={server.serverName === "core" ? "accent" : "neutral"}>
                  {server.serverName === "core" ? "Native" : "MCP"}
                </Badge>
              </div>
              {server.tools.map((tool, index) => (
                <div
                  key={tool.name}
                  className={index > 0 ? "border-t border-line px-4 py-3" : "px-4 py-3"}
                >
                  <span className="font-mono text-[13px] font-medium text-ink">{tool.name}</span>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {tool.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
