/** Mirrors IJsonToolView / IJsonSkillView / IJsonToolServerView from the backend capabilities API. */
export interface ToolView {
  name: string;
  description: string;
  /** MCP server this tool came from, or "core" for backend built-ins. */
  serverName: string;
  inputSchema?: Record<string, unknown>;
}

export type SkillKind = "workflow" | "agentic";

export interface SkillView {
  name: string;
  description: string;
  kind: SkillKind;
  inputSchema?: Record<string, unknown>;
}

/** Tools grouped by their source MCP server - what agent-config renders as a server picker. */
export interface ToolServerView {
  serverName: string;
  tools: ToolView[];
}

export interface CapabilitiesResponse {
  toolServers: ToolServerView[];
  skills: SkillView[];
}

/** Mirrors ICustomMlModelInfo from the backend custom-ml-models core. */
export interface CustomMlModelInfo {
  id: string;
  label?: string;
  contextWindow?: number;
}

export interface CustomMlModelsResponse {
  models: CustomMlModelInfo[];
}
