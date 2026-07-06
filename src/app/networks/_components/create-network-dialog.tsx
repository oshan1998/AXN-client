"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { useCreateNetwork } from "@/hooks/use-networks";
import { networkFormSchema } from "@/lib/validators/network";

interface CreateNetworkDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

/** New networks start with a single agent node so the required entryNodeId is valid. */
const ENTRY_NODE_ID = "agent-1";

export function CreateNetworkDialog({ open, onClose, onCreated }: CreateNetworkDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const createNetwork = useCreateNetwork();

  const handleSubmit = () => {
    const parsed = networkFormSchema.safeParse({ name, description: description || undefined });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message);
      return;
    }
    setValidationError(undefined);

    createNetwork.mutate(
      {
        ...parsed.data,
        entryNodeId: ENTRY_NODE_ID,
        nodes: [
          {
            nodeId: ENTRY_NODE_ID,
            type: "agent",
            config: { name: "New Agent", position: { x: 120, y: 160 } },
          },
        ],
        edges: [],
      },
      {
        onSuccess: (network) => {
          setName("");
          setDescription("");
          onCreated(network._id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="New network">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Field label="Name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Support Router"
            autoFocus
          />
        </Field>
        <Field label="Description" hint="Optional — what this network is for.">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Routes support questions to billing or general agents"
            className="min-h-20"
          />
        </Field>

        {(validationError ?? (createNetwork.isError ? createNetwork.error.message : undefined)) ? (
          <p className="text-[13px] text-danger">
            {validationError ?? createNetwork.error?.message}
          </p>
        ) : null}

        <p className="text-xs leading-relaxed text-ink-faint">
          The network starts with one agent node as its entry point — you can reshape the graph in
          the editor.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={createNetwork.isPending}>
            {createNetwork.isPending ? "Creating…" : "Create network"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
