"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TraceSteps } from "@/components/features/trace/trace-steps";
import { useRunChat } from "@/hooks/use-chats";
import { createChat } from "@/lib/data/chats";
import { isChatRunAccepted } from "@/types/chat";

interface TestRunDialogProps {
  open: boolean;
  onClose: () => void;
  networkId: string;
  networkName: string;
  hasUnsavedChanges: boolean;
}

export function TestRunDialog({
  open,
  onClose,
  networkId,
  networkName,
  hasUnsavedChanges,
}: TestRunDialogProps) {
  const [query, setQuery] = useState("");
  const run = useRunChat();

  const submit = async () => {
    if (!query.trim() || run.isPending) return;
    const chat = await createChat(networkId);
    run.mutate({ chatId: chat.id, query: query.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} title={`Test run · ${networkName}`} className="max-w-lg">
      {hasUnsavedChanges ? (
        <p className="mb-3 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
          You have unsaved changes — the run uses the last saved graph.
        </p>
      ) : null}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a query to send through the network"
          autoFocus
        />
        <Button type="submit" size="md" disabled={run.isPending || !query.trim()}>
          <Play className="size-3.5" />
          {run.isPending ? "Running…" : "Run"}
        </Button>
      </form>

      {run.isError ? (
        <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {run.error.message}
        </p>
      ) : null}

      {run.data && !isChatRunAccepted(run.data) ? (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink">Trace</p>
            <TraceSteps steps={run.data.trace} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink">Output</p>
            <pre className="max-h-56 overflow-auto rounded-lg bg-surface-muted p-3 font-mono text-xs leading-relaxed text-ink">
              {JSON.stringify(run.data.output, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
