"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useNetworks } from "@/hooks/use-networks";
import { CreateNetworkDialog } from "./create-network-dialog";
import { NetworkCard } from "./network-card";

export function NetworksView() {
  const router = useRouter();
  const { data: networks, isPending, isError, error } = useNetworks();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!networks) return [];
    const term = search.trim().toLowerCase();
    if (!term) return networks;
    return networks.filter(
      (network) =>
        network.name.toLowerCase().includes(term) ||
        network.description?.toLowerCase().includes(term),
    );
  }, [networks, search]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface px-6">
        <h1 className="text-[15px] font-semibold">Networks</h1>
        <div className="relative ml-auto w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search networks"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New network
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isPending ? (
          <NetworksSkeleton />
        ) : isError ? (
          <EmptyState
            icon={Workflow}
            title="Couldn't reach the AXN backend"
            description={error.message}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title={search ? "No matches" : "No networks yet"}
            description={
              search
                ? `Nothing named anything like "${search}".`
                : "A network is a graph of agent, router, RAG, and classifier nodes. Create one to start designing."
            }
            action={
              search ? undefined : (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  New network
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((network) => (
              <NetworkCard key={network._id} network={network} />
            ))}
          </div>
        )}
      </div>

      <CreateNetworkDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => router.push(`/networks/${id}`)}
      />
    </div>
  );
}

function NetworksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-2xl border border-line bg-surface"
        />
      ))}
    </div>
  );
}
