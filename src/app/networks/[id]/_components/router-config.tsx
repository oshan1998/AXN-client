"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ROUTER_TYPE_LABELS } from "@/lib/node-meta";
import { ROUTER_TYPES, type RouterNodeConfig, type RouterType } from "@/types/network";
import type { NodeConfigFormProps } from "./config-panel";

interface RuleRow {
  id: number;
  keyword: string;
  branch: string;
}

function rowsFromRules(rules: Record<string, string> | undefined): RuleRow[] {
  return Object.entries(rules ?? {}).map(([keyword, branch], id) => ({ id, keyword, branch }));
}

function rulesFromRows(rows: RuleRow[]): Record<string, string> | undefined {
  const entries = rows
    .filter((row) => row.keyword.trim() && row.branch.trim())
    .map((row) => [row.keyword.trim(), row.branch.trim()]);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function RouterConfigForm({
  config,
  onChange,
  outgoingEdges,
  incomingEdgeCount,
  nodeNames,
  onEdgeConditionChange,
}: NodeConfigFormProps) {
  const router = config as RouterNodeConfig;
  const routerType = (router.routerType as RouterType | undefined) ?? "single";
  const [rows, setRows] = useState<RuleRow[]>(() => rowsFromRules(router.rules));

  const syncRows = (next: RuleRow[]) => {
    setRows(next);
    onChange({ rules: rulesFromRows(next) });
  };

  return (
    <>
      <Field label="Routing mode">
        <SegmentedControl
          options={ROUTER_TYPES.map((value) => ({ value, label: ROUTER_TYPE_LABELS[value] }))}
          value={routerType}
          onChange={(value) => onChange({ routerType: value })}
        />
      </Field>

      {routerType === "single" ? (
        <>
          <Field
            label="Keyword rules"
            hint="First keyword found in the query picks the branch; branches match edge labels below."
          >
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center gap-1.5">
                  <Input
                    value={row.keyword}
                    onChange={(event) =>
                      syncRows(rows.map((r) => (r.id === row.id ? { ...r, keyword: event.target.value } : r)))
                    }
                    placeholder="keyword"
                    className="h-8 text-[13px]"
                  />
                  <span className="text-ink-faint">→</span>
                  <Input
                    value={row.branch}
                    onChange={(event) =>
                      syncRows(rows.map((r) => (r.id === row.id ? { ...r, branch: event.target.value } : r)))
                    }
                    placeholder="branch"
                    className="h-8 text-[13px]"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 shrink-0 p-0"
                    aria-label="Remove rule"
                    onClick={() => syncRows(rows.filter((r) => r.id !== row.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setRows([...rows, { id: (rows.at(-1)?.id ?? -1) + 1, keyword: "", branch: "" }])
                }
              >
                <Plus className="size-3.5" />
                Add rule
              </Button>
            </div>
          </Field>

          <Field label="Default branch" hint="Used when no keyword matches. Leave empty to follow the unlabeled edge.">
            <Input
              value={router.defaultBranch ?? ""}
              onChange={(event) => onChange({ defaultBranch: event.target.value || undefined })}
              placeholder="e.g. general"
            />
          </Field>
        </>
      ) : null}

      {routerType === "fanOut" ? (
        <p className="rounded-lg bg-surface-muted p-3 text-xs leading-relaxed text-ink-muted">
          Broadcasts the signal to all {outgoingEdges.length} outgoing edge
          {outgoingEdges.length === 1 ? "" : "s"} in parallel. No extra configuration.
        </p>
      ) : null}

      {routerType === "fanIn" ? (
        <p className="rounded-lg bg-surface-muted p-3 text-xs leading-relaxed text-ink-muted">
          Waits for all {incomingEdgeCount} incoming branch
          {incomingEdgeCount === 1 ? "" : "es"} to arrive, then merges their payloads and
          continues.
        </p>
      ) : null}

      {outgoingEdges.length > 0 ? (
        <Field
          label="Outgoing edges"
          hint="An edge's label is its branch name; the unlabeled edge is the fallback path."
        >
          <div className="space-y-2">
            {outgoingEdges.map((edge) => (
              <div key={edge.id} className="flex items-center gap-2">
                <Input
                  value={typeof edge.label === "string" ? edge.label : ""}
                  onChange={(event) => onEdgeConditionChange(edge.id, event.target.value)}
                  placeholder="default"
                  className="h-8 w-28 text-[13px]"
                />
                <span className="truncate text-xs text-ink-muted">
                  → {nodeNames[edge.target] ?? edge.target}
                </span>
              </div>
            ))}
          </div>
        </Field>
      ) : null}
    </>
  );
}
