"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelChatRun,
  createChat,
  deleteChat,
  getChat,
  listChats,
  runChat,
} from "@/lib/data/chats";

const chatsKey = ["chats"] as const;
const chatKey = (id: string) => ["chats", id] as const;

export function useChats(networkId?: string) {
  return useQuery({
    queryKey: networkId ? [...chatsKey, networkId] : chatsKey,
    queryFn: () => listChats(networkId),
  });
}

export function useChat(id: string) {
  return useQuery({ queryKey: chatKey(id), queryFn: () => getChat(id) });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (networkId?: string) => createChat(networkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatsKey }),
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChat(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatsKey }),
  });
}

export function useRunChat() {
  return useMutation({
    mutationFn: ({
      chatId,
      query,
      runId,
    }: {
      chatId: string;
      query: string;
      runId?: string;
    }) => runChat(chatId, query, runId),
  });
}

export function useCancelChatRun() {
  return useMutation({
    mutationFn: (runId: string) => cancelChatRun(runId),
  });
}
