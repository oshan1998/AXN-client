"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useDeleteNetwork } from "@/hooks/use-networks";
import { formatRelativeTime } from "@/lib/format";
import { NODE_META } from "@/lib/node-meta";
import { NODE_TYPES, type Network } from "@/types/network";

export function NetworkCard({ network }: { network: Network }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteNetwork = useDeleteNetwork();

  const typeCounts = NODE_TYPES.map((type) => ({
    type,
    count: network.nodes.filter((node) => node.type === type).length,
  })).filter(({ count }) => count > 0);

  return (
    <div className="group relative rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-panel">
      <Link href={`/networks/${network._id}`} className="absolute inset-0 rounded-2xl" aria-label={`Open ${network.name}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-ink">{network.name}</h2>
            {network.nodes.length === 0 ? <Badge>Draft</Badge> : <Badge tone="success">Active</Badge>}
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
            {network.description || "No description"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${network.name}`}
          className="relative z-10 size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {typeCounts.length === 0 ? (
          <span className="text-xs text-ink-faint">Empty graph</span>
        ) : (
          typeCounts.map(({ type, count }) => (
            <Badge key={type} className={NODE_META[type].softClass}>
              {count} {NODE_META[type].label.toLowerCase()}
            </Badge>
          ))
        )}
        <span className="ml-auto text-xs text-ink-faint">
          {formatRelativeTime(network.updatedAt)}
        </span>
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete network">
        <p className="text-sm leading-relaxed text-ink-muted">
          Delete <span className="font-medium text-ink">{network.name}</span> and its graph? This
          can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={deleteNetwork.isPending}
            onClick={() =>
              deleteNetwork.mutate(network._id, { onSuccess: () => setConfirmOpen(false) })
            }
          >
            {deleteNetwork.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
