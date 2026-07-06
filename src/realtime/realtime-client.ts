import type { NetworkStepEvent, NetworkStepUi, RealtimeStatus, ServerMessage } from '@/types/trace';
import { env } from '@/config/env';

type MessageListener = (message: ServerMessage) => void;
type StatusListener = (status: RealtimeStatus) => void;

function wsUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${env.wsPath}`;
}

class RealtimeClient {
  private socket: WebSocket | null = null;
  private status: RealtimeStatus = 'idle';
  private readonly messageListeners = new Set<MessageListener>();
  private readonly statusListeners = new Set<StatusListener>();
  private readonly subscribedChats = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  connect(): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.setStatus('connecting');
    const socket = new WebSocket(wsUrl());
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.setStatus('open');
      socket.send(JSON.stringify({ type: 'hello', payload: { clientVersion: 'axn-client' } }));
      for (const chatId of this.subscribedChats) {
        socket.send(JSON.stringify({ type: 'subscribe', payload: { chatId } }));
      }
    });

    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as ServerMessage;
        for (const listener of this.messageListeners) {
          listener(message);
        }
      } catch {
        // Ignore malformed frames.
      }
    });

    socket.addEventListener('close', () => {
      this.socket = null;
      this.setStatus('closed');
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    });

    socket.addEventListener('error', () => {
      socket.close();
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.setStatus('idle');
  }

  subscribe(chatId: string): void {
    if (!chatId) {
      return;
    }
    this.subscribedChats.add(chatId);
    this.connect();
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe', payload: { chatId } }));
    }
  }

  unsubscribe(chatId: string): void {
    this.subscribedChats.delete(chatId);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'unsubscribe', payload: { chatId } }));
    }
  }

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 1500);
  }

  private setStatus(status: RealtimeStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}

export const realtimeClient = new RealtimeClient();

export function mergeNetworkStep(
  steps: NetworkStepUi[],
  event: NetworkStepEvent,
): NetworkStepUi[] {
  const id = `${event.runId}:${event.nodeId}`;

  if (event.phase === 'start') {
    const existing = steps.find((step) => step.id === id);
    if (existing) {
      return steps.map((step) =>
        step.id === id ? { ...step, status: 'active' as const } : step,
      );
    }
    return [
      ...steps.map((step) =>
        step.status === 'active' ? { ...step, status: 'complete' as const } : step,
      ),
      {
        id,
        nodeId: event.nodeId,
        nodeType: event.nodeType,
        status: 'active' as const,
        agentRunId: event.agentRunId,
        agentSteps: [],
      },
    ];
  }

  return steps.map((step) =>
    step.id === id
      ? {
          ...step,
          status: 'complete' as const,
          branch: event.branch ?? step.branch,
          agentRunId: event.agentRunId ?? step.agentRunId,
        }
      : step,
  );
}
