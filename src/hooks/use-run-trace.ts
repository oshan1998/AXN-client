"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mergeAgentTraceIntoSteps } from "@/realtime/merge-trace-steps";
import { mergeNetworkStep, realtimeClient } from "@/realtime/realtime-client";
import type {
  ChatRunResultEvent,
  NetworkStepUi,
  RealtimeStatus,
} from "@/types/trace";
import type { AgentTracePayload, NetworkStepEvent } from "@/types/trace";

interface UseRunTraceOptions {
  chatId?: string;
  runId?: string;
  enabled?: boolean;
  onRunResult?: (event: ChatRunResultEvent) => void;
}

export function useRunTrace({
  chatId,
  runId,
  enabled = true,
  onRunResult,
}: UseRunTraceOptions) {
  const [networkSteps, setNetworkSteps] = useState<NetworkStepUi[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeStatus>("idle");
  const onRunResultRef = useRef(onRunResult);
  onRunResultRef.current = onRunResult;

  const reset = useCallback(() => {
    setNetworkSteps([]);
  }, []);

  useEffect(() => {
    if (!chatId || !enabled) {
      return;
    }
    realtimeClient.subscribe(chatId);
    return () => realtimeClient.unsubscribe(chatId);
  }, [chatId, enabled]);

  useEffect(() => {
    return realtimeClient.onStatus(setConnectionStatus);
  }, []);

  useEffect(() => {
    if (!chatId || !runId || !enabled) {
      return;
    }

    return realtimeClient.onMessage((message) => {
      if (message.type === "network_step") {
        const event = message.payload as NetworkStepEvent;
        if (event.chatId !== chatId || event.runId !== runId) {
          return;
        }
        setNetworkSteps((prev) => mergeNetworkStep(prev, event));
        return;
      }

      if (message.type === "agent_trace") {
        const payload = message.payload as AgentTracePayload;
        if (payload.chatId !== chatId) {
          return;
        }
        setNetworkSteps((prev) => {
          const nodeStep = prev.find((step) => step.agentRunId === payload.runId);
          if (!nodeStep) {
            return prev;
          }
          return prev.map((step) =>
            step.id === nodeStep.id
              ? {
                  ...step,
                  agentSteps: mergeAgentTraceIntoSteps(step.agentSteps, payload),
                }
              : step,
          );
        });
        return;
      }

      if (message.type === "run_result") {
        const event = message.payload as ChatRunResultEvent;
        if (event.chatId !== chatId || event.runId !== runId) {
          return;
        }
        onRunResultRef.current?.(event);
      }
    });
  }, [chatId, runId, enabled]);

  const activeNodeId =
    networkSteps.find((step) => step.status === "active")?.nodeId ?? null;

  return {
    networkSteps,
    activeNodeId,
    connectionStatus,
    reset,
  };
}

export type { NetworkStepUi } from "@/types/trace";
