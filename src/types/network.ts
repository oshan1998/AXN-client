/** Mirrors src/common/constants/network.enum.ts in the AXN backend. */
export const NODE_TYPES = ["agent", "router", "rag", "classifier"] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const ROUTER_TYPES = ["single", "fanOut", "fanIn"] as const;
export type RouterType = (typeof ROUTER_TYPES)[number];

export const CLASSIFIER_TYPES = ["keyword", "llm"] as const;
export type ClassifierType = (typeof CLASSIFIER_TYPES)[number];

/** Mirrors src/core/llm-adapters/constants/llm-provider.enum.ts. */
export const LLM_PROVIDERS = ["openai", "gemini", "ollama", "mock"] as const;
export type LlmProvider = (typeof LLM_PROVIDERS)[number];

/**
 * Node config is a free-form object on the backend (Mongoose `type: Object`).
 * These shapes document what each executor reads, plus UI-only extras the
 * backend ignores (`name`, `position`).
 */
export interface NodeConfigBase {
  /** Display name shown on the canvas; not read by any executor. */
  name?: string;
  /** Canvas coordinates persisted so layouts survive reloads. */
  position?: { x: number; y: number };
}

export interface AgentNodeConfig extends NodeConfigBase {
  systemPrompt?: string;
  provider?: LlmProvider;
  model?: string;
  /** Restricts tools to those from these MCP servers (or "core"). Omit for "all tools". */
  mcpServerNames?: string[];
  /** Restricts which registered skills this agent may call. Omit for "all skills". */
  skillNames?: string[];
  maxIterations?: number;
}

export interface RouterNodeConfig extends NodeConfigBase {
  routerType?: RouterType;
  /** single: keyword → branch label matching an outgoing edge condition. */
  rules?: Record<string, string>;
  defaultBranch?: string;
  /** fanIn: how many branches to wait for; defaults to incoming edge count. */
  waitFor?: number;
}

export interface RagNodeConfig extends NodeConfigBase {
  corpusId?: string;
  topK?: number;
}

export interface ClassifierNodeConfig extends NodeConfigBase {
  classifierType?: ClassifierType;
  labels?: string[];
  defaultLabel?: string;
  /** llm only — Vertex Model Garden model id override. */
  model?: string;
  /** llm only — node-specific instruction on how to classify the query. */
  systemPrompt?: string;
}

export type NodeConfig =
  | AgentNodeConfig
  | RouterNodeConfig
  | RagNodeConfig
  | ClassifierNodeConfig;

export interface NetworkNode {
  nodeId: string;
  type: NodeType;
  config?: NodeConfigBase & Record<string, unknown>;
}

export interface NetworkEdge {
  from: string;
  to: string;
  /** Matched against a router/classifier branch label when present. */
  condition?: string;
}

export interface Network {
  _id: string;
  name: string;
  description?: string;
  entryNodeId: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNetworkInput {
  name: string;
  description?: string;
  entryNodeId: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export type UpdateNetworkInput = Partial<CreateNetworkInput>;

export interface NetworkTraceStep {
  nodeId: string;
  type: NodeType;
  branch?: string;
  agentRunId?: string;
}
