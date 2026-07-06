import { Bot, FolderSearch, Split, Tags, type LucideIcon } from "lucide-react";
import type { ClassifierType, LlmProvider, NodeType, RouterType } from "@/types/network";

/**
 * Single source of truth for the per-node-type visual language, used
 * identically on the canvas, the palette, the chat trace, and badges.
 */
export interface NodeTypeMeta {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Solid fill + white glyph, e.g. palette swatches and trace dots. */
  solidClass: string;
  /** Soft tinted background + colored text, e.g. badges. */
  softClass: string;
  /** Border/ring color used to highlight a selected canvas node. */
  ringClass: string;
  description: string;
}

export const NODE_META: Record<NodeType, NodeTypeMeta> = {
  agent: {
    label: "Agent",
    shortLabel: "A",
    icon: Bot,
    solidClass: "bg-node-agent text-white",
    softClass: "bg-node-agent-soft text-node-agent",
    ringClass: "border-node-agent",
    description: "Runs an LLM loop with tools and skills",
  },
  router: {
    label: "Router",
    shortLabel: "R",
    icon: Split,
    solidClass: "bg-node-router text-white",
    softClass: "bg-node-router-soft text-node-router",
    ringClass: "border-node-router",
    description: "Directs the signal along one or many edges",
  },
  rag: {
    label: "RAG",
    shortLabel: "G",
    icon: FolderSearch,
    solidClass: "bg-node-rag text-white",
    softClass: "bg-node-rag-soft text-node-rag",
    ringClass: "border-node-rag",
    description: "Retrieves context from a document corpus",
  },
  classifier: {
    label: "Classifier",
    shortLabel: "C",
    icon: Tags,
    solidClass: "bg-node-classifier text-white",
    softClass: "bg-node-classifier-soft text-node-classifier",
    ringClass: "border-node-classifier",
    description: "Labels the query and branches on the label",
  },
};

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  ollama: "Ollama",
  mock: "Mock (testing)",
};

/** Suggested models per provider; free-text entry stays possible. */
export const PROVIDER_MODELS: Record<LlmProvider, string[]> = {
  openai: ["gpt-4.1", "gpt-4.1-mini", "gpt-4o"],
  gemini: ["gemini-2.5-pro", "gemini-2.5-flash"],
  ollama: ["qwen3:1.7b", "llama3.2", "mistral"],
  mock: ["mock-model"],
};

export const ROUTER_TYPE_LABELS: Record<RouterType, string> = {
  single: "Single",
  fanOut: "Fan-out",
  fanIn: "Fan-in",
};

export const CLASSIFIER_TYPE_LABELS: Record<ClassifierType, string> = {
  keyword: "Keyword",
  llm: "LLM",
};
