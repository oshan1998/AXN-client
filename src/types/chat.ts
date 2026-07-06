import type { NetworkTraceStep } from "./network";
import type { NetworkStepUi } from "./trace";

export interface ChatAttachment {
  fileName: string;
  url: string;
  size: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** Files uploaded to the chat's workspace alongside this message. */
  attachments?: ChatAttachment[];
  /** Node hops for the run that produced this assistant message. */
  trace?: NetworkTraceStep[];
  /** Live trace snapshot captured when the run completed. */
  liveTrace?: NetworkStepUi[];
}

/** Backend chat summary returned by GET /chats. */
export interface ChatSummary {
  id: string;
  networkId?: string;
  parentChatId?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Backend chat detail returned by GET /chats/:id. */
export interface ChatDetail extends ChatSummary {
  messages: Array<{
    role: "user" | "assistant" | "tool";
    content: string;
    createdAt: string;
  }>;
}

/**
 * Client-side conversation index (localStorage). Each conversation maps to a
 * backend chat id once created via POST /chats.
 */
export interface Conversation {
  id: string;
  networkId: string;
  title: string;
  /** Backend chat continued across runs; set after create or first run. */
  chatId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatRunResult {
  output: unknown;
  trace: NetworkTraceStep[];
  chatId?: string;
  runId?: string;
}

/** Returned immediately when a chat run is accepted for background execution. */
export interface ChatRunAccepted {
  runId: string;
  chatId: string;
  status: "accepted";
}

export type ChatRunResponse = ChatRunResult | ChatRunAccepted;

export function isChatRunAccepted(
  value: ChatRunResponse,
): value is ChatRunAccepted {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    (value as ChatRunAccepted).status === "accepted"
  );
}
