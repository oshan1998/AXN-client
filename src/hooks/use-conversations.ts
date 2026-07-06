"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getConversationsServerSnapshot,
  getConversationsSnapshot,
  subscribeConversations,
  updateConversations,
} from "@/lib/chat-store";
import type { ChatMessage, Conversation } from "@/types/chat";

export function useConversations() {
  const conversations = useSyncExternalStore(
    subscribeConversations,
    getConversationsSnapshot,
    getConversationsServerSnapshot,
  );

  const createConversation = useCallback((networkId: string): Conversation => {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      networkId,
      title: "New conversation",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    updateConversations((current) => [conversation, ...current]);
    return conversation;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    updateConversations((current) =>
      current.filter((conversation) => conversation.id !== id),
    );
  }, []);

  const appendMessage = useCallback(
    (
      id: string,
      message: ChatMessage,
      patch?: Partial<Pick<Conversation, "title" | "chatId">>,
    ) => {
      updateConversations((current) =>
        current.map((conversation) =>
          conversation.id === id
            ? {
                ...conversation,
                ...patch,
                messages: [...conversation.messages, message],
                updatedAt: message.createdAt,
              }
            : conversation,
        ),
      );
    },
    [],
  );

  const ensureChat = useCallback((id: string, chatId: string) => {
    updateConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, chatId } : conversation,
      ),
    );
  }, []);

  return { conversations, createConversation, deleteConversation, appendMessage, ensureChat };
}
