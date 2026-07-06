"use client";

import { CheckboxList } from "@/components/ui/checkbox-list";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCapabilities } from "@/hooks/use-capabilities";
import { PROVIDER_LABELS, PROVIDER_MODELS } from "@/lib/node-meta";
import { LLM_PROVIDERS, type AgentNodeConfig, type LlmProvider } from "@/types/network";
import type { NodeConfigFormProps } from "./config-panel";

export function AgentConfigForm({ config, onChange }: NodeConfigFormProps) {
  const agent = config as AgentNodeConfig;
  const provider = (agent.provider as LlmProvider | undefined) ?? "";
  const modelSuggestions = provider ? PROVIDER_MODELS[provider] : [];
  const { data: capabilities, isPending, isError } = useCapabilities();

  return (
    <>
      <Field label="LLM provider" hint="Leave on default to use the backend's configured provider.">
        <Select
          value={provider}
          onChange={(event) =>
            onChange({ provider: event.target.value || undefined, model: undefined })
          }
        >
          <option value="">Backend default</option>
          {LLM_PROVIDERS.map((value) => (
            <option key={value} value={value}>
              {PROVIDER_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Model" hint="Suggestions depend on the provider; any model id is accepted.">
        <>
          <Input
            value={agent.model ?? ""}
            onChange={(event) => onChange({ model: event.target.value || undefined })}
            placeholder={modelSuggestions[0] ?? "provider default"}
            list="agent-model-suggestions"
          />
          <datalist id="agent-model-suggestions">
            {modelSuggestions.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </>
      </Field>

      <Field label="System prompt">
        <Textarea
          value={agent.systemPrompt ?? ""}
          onChange={(event) => onChange({ systemPrompt: event.target.value || undefined })}
          placeholder="You are a helpful billing specialist…"
        />
      </Field>

      <Field label="Tools" hint="Selects entire MCP servers (all their tools) this agent may call. Empty allows all.">
        {isPending ? (
          <p className="text-[13px] text-ink-faint">Loading tool servers…</p>
        ) : isError || !capabilities ? (
          <p className="text-[13px] text-danger">Couldn&apos;t load tool servers from the backend.</p>
        ) : capabilities.toolServers.length === 0 ? (
          <p className="text-[13px] text-ink-faint">No tool servers registered yet.</p>
        ) : (
          <CheckboxList
            options={capabilities.toolServers.map((server) => ({
              value: server.serverName,
              label: server.serverName,
              description: `${server.tools.length} tool${server.tools.length === 1 ? "" : "s"}: ${server.tools
                .map((tool) => tool.name)
                .join(", ")}`,
            }))}
            selected={agent.mcpServerNames ?? []}
            onChange={(mcpServerNames) =>
              onChange({ mcpServerNames: mcpServerNames.length > 0 ? mcpServerNames : undefined })
            }
          />
        )}
      </Field>

      <Field label="Skills" hint="Restricts which registered skills this agent may call. Empty allows all.">
        {isPending ? (
          <p className="text-[13px] text-ink-faint">Loading skills…</p>
        ) : isError || !capabilities ? (
          <p className="text-[13px] text-danger">Couldn&apos;t load skills from the backend.</p>
        ) : capabilities.skills.length === 0 ? (
          <p className="text-[13px] text-ink-faint">No skills registered yet.</p>
        ) : (
          <CheckboxList
            options={capabilities.skills.map((skill) => ({
              value: skill.name,
              label: skill.name,
              description: skill.description,
            }))}
            selected={agent.skillNames ?? []}
            onChange={(skillNames) =>
              onChange({ skillNames: skillNames.length > 0 ? skillNames : undefined })
            }
          />
        )}
      </Field>

      <Field label="Max iterations" hint="Upper bound on the agent's think→act loop for one run.">
        <Input
          type="number"
          min={1}
          max={25}
          value={agent.maxIterations ?? ""}
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            onChange({ maxIterations: Number.isNaN(value) ? undefined : value });
          }}
          placeholder="Backend default"
          className="w-32"
        />
      </Field>
    </>
  );
}
