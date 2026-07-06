"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { useConversations } from "@/hooks/use-conversations";
import { useRunTrace } from "@/hooks/use-run-trace";
import { useCancelChatRun, useDeleteChat, useRunChat } from "@/hooks/use-chats";
import { useNetworks } from "@/hooks/use-networks";
import { ApiError } from "@/lib/data/api-client";
import { createChat, uploadChatFiles } from "@/lib/data/chats";
import { extractReply } from "@/lib/run-output";
import { realtimeClient } from "@/realtime/realtime-client";
import type { ChatMessage } from "@/types/chat";
import { isChatRunAccepted } from "@/types/chat";
import type { ChatRunResultEvent, NetworkStepUi } from "@/types/trace";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { TraceRail } from "./trace-rail";

function networkStepsFromHttpTrace(
  trace: Array<{ nodeId: string; type: NetworkStepUi["nodeType"]; branch?: string; agentRunId?: string }>,
): NetworkStepUi[] {
  return trace.map((step, index) => ({
    id: `http:${step.nodeId}:${index}`,
    nodeId: step.nodeId,
    nodeType: step.type,
    status: "complete" as const,
    branch: step.branch,
    agentRunId: step.agentRunId,
    agentSteps: [],
  }));
}

export function ChatView() {
  const { data: networks } = useNetworks();
  const { conversations, createConversation, deleteConversation, appendMessage, ensureChat } =
    useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingNetworkId, setPendingNetworkId] = useState<string>("");
  const [activeRunId, setActiveRunId] = useState<string | undefined>();
  const [traceChatId, setTraceChatId] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const runChat = useRunChat();
  const cancelChatRun = useCancelChatRun();
  const deleteChat = useDeleteChat();

  const active = conversations.find((conversation) => conversation.id === activeId) ?? null;
  const activeNetworkId = active?.networkId ?? pendingNetworkId ?? networks?.[0]?._id ?? "";
  const activeNetwork = networks?.find((network) => network._id === activeNetworkId);

  const networkConversations = useMemo(
    () => conversations.filter((conversation) => conversation.networkId === activeNetworkId),
    [conversations, activeNetworkId],
  );

  const activeConversationIdRef = useRef<string | null>(null);
  activeConversationIdRef.current = active?.id ?? null;

  const networkStepsRef = useRef<NetworkStepUi[]>([]);

  const finalizeRun = useCallback(
    (event: ChatRunResultEvent) => {
      const conversationId = activeConversationIdRef.current;
      if (!conversationId) {
        return;
      }

      setIsRunning(false);
      setActiveRunId(undefined);
      setTraceChatId(undefined);

      if (event.status === "complete" && event.result) {
        appendMessage(
          conversationId,
          {
            role: "assistant",
            content: extractReply(event.result),
            createdAt: new Date().toISOString(),
            trace: event.result.trace,
            liveTrace:
              networkStepsRef.current.length > 0
                ? networkStepsRef.current
                : undefined,
          },
          { chatId: event.chatId },
        );
        return;
      }

      if (event.status === "cancelled") {
        appendMessage(conversationId, {
          role: "assistant",
          content: "Run cancelled.",
          createdAt: new Date().toISOString(),
          liveTrace:
            networkStepsRef.current.length > 0
              ? networkStepsRef.current
              : undefined,
        });
        return;
      }

      appendMessage(conversationId, {
        role: "assistant",
        content: `Run failed: ${event.error ?? "Unknown error"}`,
        createdAt: new Date().toISOString(),
        liveTrace:
          networkStepsRef.current.length > 0
            ? networkStepsRef.current
            : undefined,
      });
    },
    [appendMessage],
  );

  const { networkSteps, connectionStatus, reset } = useRunTrace({
    chatId: traceChatId ?? active?.chatId,
    runId: activeRunId,
    enabled: isRunning || Boolean(activeRunId),
    onRunResult: finalizeRun,
  });
  networkStepsRef.current = networkSteps;

  const nodeNames = useMemo(
    () =>
      Object.fromEntries(
        (activeNetwork?.nodes ?? []).map((node) => [
          node.nodeId,
          (node.config?.name as string) || node.nodeId,
        ]),
      ),
    [activeNetwork],
  );

  const startConversation = useCallback(async () => {
    const networkId = pendingNetworkId || networks?.[0]?._id;
    if (!networkId) return;
    const conversation = createConversation(networkId);
    setActiveId(conversation.id);
    try {
      const { id } = await createChat(networkId);
      ensureChat(conversation.id, id);
      setTraceChatId(id);
      realtimeClient.subscribe(id);
    } catch {
      // Run will create a chat server-side if this fails.
    }
  }, [createConversation, ensureChat, networks, pendingNetworkId]);

  const send = async (text: string, files?: File[]) => {
    if (!active || isRunning || runChat.isPending) return;
    const now = new Date().toISOString();
    const runId = crypto.randomUUID();

    let chatId = active.chatId;
    if (!chatId) {
      try {
        const created = await createChat(active.networkId);
        chatId = created.id;
        ensureChat(active.id, chatId);
      } catch {
        return;
      }
    }

    let query = text;
    let attachments: ChatMessage["attachments"];
    if (files && files.length > 0) {
      try {
        const uploaded = await uploadChatFiles(chatId, files);
        attachments = uploaded.map((file) => ({
          fileName: file.fileName,
          url: file.url,
          size: file.size,
        }));
        const notes = uploaded
          .map((file) => `[Attached file: "${file.fileName}", available in your workspace at "${file.path}"]`)
          .join("\n");
        query = text ? `${text}\n\n${notes}` : notes;
      } catch (error) {
        appendMessage(active.id, {
          role: "assistant",
          content: `Upload failed: ${error instanceof ApiError ? error.message : "Unknown error"}`,
          createdAt: new Date().toISOString(),
        });
        return;
      }
    }

    appendMessage(
      active.id,
      { role: "user", content: text, createdAt: now, attachments },
      active.messages.length === 0
        ? { title: (text || files?.[0]?.name || "New conversation").slice(0, 64) }
        : undefined,
    );

    reset();
    setTraceChatId(chatId);
    setActiveRunId(runId);
    setIsRunning(true);
    realtimeClient.subscribe(chatId);

    runChat.mutate(
      {
        chatId,
        query,
        runId,
      },
      {
        onSuccess: (response) => {
          if (isChatRunAccepted(response)) {
            ensureChat(active.id, response.chatId);
            setTraceChatId(response.chatId);
            return;
          }

          // Sync fallback (no runId) — finalize immediately.
          appendMessage(
            active.id,
            {
              role: "assistant",
              content: extractReply(response),
              createdAt: new Date().toISOString(),
              trace: response.trace,
              liveTrace:
                networkStepsRef.current.length > 0
                  ? networkStepsRef.current
                  : undefined,
            },
            { chatId: response.chatId ?? chatId },
          );
          setIsRunning(false);
          setActiveRunId(undefined);
          setTraceChatId(undefined);
        },
        onError: (error) => {
          appendMessage(active.id, {
            role: "assistant",
            content: `Run failed: ${error.message}`,
            createdAt: new Date().toISOString(),
          });
          setIsRunning(false);
          setActiveRunId(undefined);
          setTraceChatId(undefined);
        },
      },
    );
  };

  const cancelRun = useCallback(() => {
    if (!activeRunId || !isRunning) return;
    cancelChatRun.mutate(activeRunId, {
      onError: () => {
        // Run may have already finished; WS run_result handles the UI state.
      },
    });
  }, [activeRunId, cancelChatRun, isRunning]);

  const lastAssistant = [...(active?.messages ?? [])]
    .reverse()
    .find((message) => message.role === "assistant");

  const displaySteps = isRunning
    ? networkSteps
    : (lastAssistant?.liveTrace ??
      (lastAssistant?.trace
        ? networkStepsFromHttpTrace(lastAssistant.trace)
        : []));

  if (networks && networks.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No networks to chat with"
        description="Chat runs a query through one of your networks. Create a network first."
        action={
          <Button size="sm">
            <Link href="/networks">Go to networks</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
        <h1 className="text-[15px] font-semibold">Chat</h1>
        <Select
          value={activeNetworkId}
          onChange={(event) => setPendingNetworkId(event.target.value)}
          disabled={Boolean(active && active.messages.length > 0)}
          className="w-56"
          aria-label="Network"
        >
          {!activeNetworkId ? <option value="">Select a network</option> : null}
          {(networks ?? []).map((network) => (
            <option key={network._id} value={network._id}>
              {network.name}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto" onClick={startConversation} disabled={!networks?.length}>
          <Plus className="size-4" />
          New conversation
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <ConversationList
          conversations={networkConversations}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={(id) => {
            const conversation = conversations.find((item) => item.id === id);
            deleteConversation(id);
            if (id === activeId) setActiveId(null);
            if (conversation?.chatId) {
              deleteChat.mutate(conversation.chatId, {
                onError: () => {
                  // The local conversation is already gone; the backend chat may
                  // have never been created (no messages sent yet) or is already gone.
                },
              });
            }
          }}
        />

        <MessageThread
          conversation={active}
          networkName={activeNetwork?.name}
          running={isRunning}
          cancelling={cancelChatRun.isPending}
          onSend={send}
          onCancel={cancelRun}
          onStart={startConversation}
          canStart={Boolean(networks?.length)}
        />

        <TraceRail
          steps={displaySteps}
          running={isRunning}
          nodeNames={nodeNames}
          connectionStatus={connectionStatus}
          onCancel={cancelRun}
          cancelling={cancelChatRun.isPending}
        />
      </div>
    </div>
  );
}
