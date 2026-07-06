"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { RagNodeConfig } from "@/types/network";
import type { NodeConfigFormProps } from "./config-panel";

export function RagConfigForm({ config, onChange }: NodeConfigFormProps) {
  const rag = config as RagNodeConfig;

  return (
    <>
      <Field label="Corpus" hint="Identifier of the document corpus to retrieve from.">
        <Input
          value={rag.corpusId ?? ""}
          onChange={(event) => onChange({ corpusId: event.target.value || undefined })}
          placeholder="support-kb"
        />
      </Field>

      <Field label="Top K" hint="How many chunks to retrieve per query.">
        <Input
          type="number"
          min={1}
          max={50}
          value={rag.topK ?? ""}
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            onChange({ topK: Number.isNaN(value) ? undefined : value });
          }}
          placeholder="5"
          className="w-32"
        />
      </Field>

      <p className="rounded-lg bg-warning-soft p-3 text-xs leading-relaxed text-warning">
        Retrieval is a placeholder in the backend right now — this node passes through a stub
        context until core/rag lands.
      </p>
    </>
  );
}
