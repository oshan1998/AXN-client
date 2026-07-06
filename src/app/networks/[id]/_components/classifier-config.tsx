"use client";

import { ChipInput } from "@/components/ui/chip-input";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useCustomMlModels } from "@/hooks/use-capabilities";
import { CLASSIFIER_TYPE_LABELS } from "@/lib/node-meta";
import { CLASSIFIER_TYPES, type ClassifierNodeConfig } from "@/types/network";
import type { NodeConfigFormProps } from "./config-panel";

export function ClassifierConfigForm({
  config,
  onChange,
  outgoingEdges,
  nodeNames,
  onEdgeConditionChange,
}: NodeConfigFormProps) {
  const classifier = config as ClassifierNodeConfig;
  const classifierType = classifier.classifierType ?? "keyword";
  const labels = classifier.labels ?? [];

  const updateLabels = (next: string[]) => {
    const patch: Record<string, unknown> = { labels: next.length > 0 ? next : undefined };
    if (classifier.defaultLabel && !next.includes(classifier.defaultLabel)) {
      patch.defaultLabel = undefined;
    }
    onChange(patch);
  };

  return (
    <>
      <Field
        label="Classifier type"
        hint="LLM sends the query to a custom ML model for classification; Keyword does a simple substring match."
      >
        <SegmentedControl
          options={CLASSIFIER_TYPES.map((value) => ({ value, label: CLASSIFIER_TYPE_LABELS[value] }))}
          value={classifierType}
          onChange={(value) => onChange({ classifierType: value })}
        />
      </Field>

      <Field
        label="Labels"
        hint={
          classifierType === "llm"
            ? "The categories the model must classify the query into; the chosen label becomes the branch, so it should match an outgoing edge label."
            : "The query is matched against these; the winning label becomes the branch, so it should match an outgoing edge label."
        }
      >
        <ChipInput values={labels} onChange={updateLabels} placeholder="Label + Enter" />
      </Field>

      <Field label="Default label" hint="Used when nothing matches.">
        <Select
          value={classifier.defaultLabel ?? ""}
          onChange={(event) => onChange({ defaultLabel: event.target.value || undefined })}
          disabled={labels.length === 0}
        >
          <option value="">None</option>
          {labels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      {classifierType === "llm" ? <LlmClassifierFields classifier={classifier} onChange={onChange} /> : null}

      {outgoingEdges.length > 0 ? (
        <Field
          label="Outgoing edges"
          hint="An edge's label is the branch it matches; the unlabeled edge is the fallback path."
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

function LlmClassifierFields({
  classifier,
  onChange,
}: {
  classifier: ClassifierNodeConfig;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const { data: customMlModels, isPending, isError } = useCustomMlModels();
  const models = customMlModels?.models ?? [];

  return (
    <>
      <Field
        label="Model"
        hint="Suggestions come from the backend's configured custom ML models; any model id is accepted."
      >
        <>
          <Input
            value={classifier.model ?? ""}
            onChange={(event) => onChange({ model: event.target.value || undefined })}
            placeholder="backend default"
            list="classifier-model-suggestions"
          />
          <datalist id="classifier-model-suggestions">
            {models.map((model) => (
              <option key={model.id} value={model.id} />
            ))}
          </datalist>
        </>
      </Field>
      {isPending ? <p className="text-xs text-ink-faint">Loading available models…</p> : null}
      {isError ? <p className="text-xs text-danger">Couldn&apos;t load models from the backend.</p> : null}

      <Field
        label="Classification instruction"
        hint="Node-specific guidance for how the model should classify the query into the labels above."
      >
        <Textarea
          value={classifier.systemPrompt ?? ""}
          onChange={(event) => onChange({ systemPrompt: event.target.value || undefined })}
          placeholder="Classify billing questions as “billing”, technical issues as “support”…"
        />
      </Field>
    </>
  );
}
