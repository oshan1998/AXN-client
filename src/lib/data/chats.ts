import type {
  ChatDetail,
  ChatRunAccepted,
  ChatRunResponse,
  ChatRunResult,
  ChatSummary,
} from "@/types/chat";
import { isChatRunAccepted } from "@/types/chat";
import { apiFetch } from "./api-client";

export function listChats(networkId?: string): Promise<ChatSummary[]> {
  const query = networkId ? `?networkId=${encodeURIComponent(networkId)}` : "";
  return apiFetch<ChatSummary[]>(`/chats${query}`);
}

export function getChat(id: string): Promise<ChatDetail> {
  return apiFetch<ChatDetail>(`/chats/${id}`);
}

export function createChat(networkId?: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/chats", {
    method: "POST",
    body: networkId ? { networkId } : {},
  });
}

export function deleteChat(id: string): Promise<void> {
  return apiFetch<void>(`/chats/${id}`, { method: "DELETE" });
}

/**
 * Starts a chat run. When `runId` is provided the backend returns 202
 * immediately and completes via WebSocket `run_result`. Without `runId` the
 * call blocks until the run finishes (test tooling).
 */
export function runChat(
  id: string,
  query: string,
  runId?: string,
): Promise<ChatRunResponse> {
  return apiFetch<ChatRunResponse>(`/chats/${id}/run`, {
    method: "POST",
    body: { query, runId },
  });
}

export function cancelChatRun(runId: string): Promise<{ cancelled: boolean }> {
  return apiFetch<{ cancelled: boolean }>(`/chats/runs/${runId}/cancel`, {
    method: "POST",
  });
}

export interface UploadedFile {
  fileName: string;
  path: string;
  size: number;
  url: string;
}

/** Uploads one or more files into the chat's workspace directory. */
export function uploadChatFiles(id: string, files: File[]): Promise<UploadedFile[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return apiFetch<UploadedFile[]>(`/chats/${id}/upload`, {
    method: "POST",
    body: formData,
  });
}

export type { ChatRunAccepted, ChatRunResult, ChatRunResponse };
export { isChatRunAccepted };
