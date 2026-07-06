import type { Conversation } from "@/types/chat";

const STORAGE_KEY = "axn.conversations.v1";

/**
 * Conversations live in localStorage (client-side index). Backend chat records
 * are created via POST /chats and linked by chatId.
 */
const EMPTY: Conversation[] = [];
let cache: Conversation[] | null = null;
const listeners = new Set<() => void>();

function read(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Array<
      Conversation & { sessionId?: string }
    >;
    return parsed.map(({ sessionId, ...rest }) => ({
      ...rest,
      chatId: rest.chatId ?? sessionId,
    }));
  } catch {
    return EMPTY;
  }
}

export function subscribeConversations(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConversationsSnapshot(): Conversation[] {
  if (cache === null) {
    cache = read();
  }
  return cache;
}

export function getConversationsServerSnapshot(): Conversation[] {
  return EMPTY;
}

export function updateConversations(
  updater: (current: Conversation[]) => Conversation[],
): void {
  cache = updater(getConversationsSnapshot());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  listeners.forEach((listener) => listener());
}
