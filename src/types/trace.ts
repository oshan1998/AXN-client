/** Mirrors AXN backend modules/realtime — keep in sync. */

export type TracePhase = 'start' | 'end';

export type AgentRunOutcome =
  | 'complete'
  | 'max_iterations'
  | 'cancelled'
  | 'timed_out';

export type AgentTraceStep =
  | {
      step: 'thought';
      iteration: number;
      phase: TracePhase;
      text?: string;
    }
  | {
      step: 'tool';
      iteration: number;
      name: string;
      phase: TracePhase;
    }
  | {
      step: 'skill';
      iteration: number;
      name: string;
      phase: TracePhase;
    }
  | {
      step: 'skill_tool';
      iteration: number;
      skill: string;
      tool: string;
      phase: TracePhase;
    }
  | {
      step: 'iteration_error';
      iteration: number;
      message: string;
    }
  | { step: 'run_done'; outcome: AgentRunOutcome };

export type AgentTracePayload = {
  chatId: string;
  runId: string;
  seq: number;
  ts: string;
} & AgentTraceStep;

export type NetworkStepEvent = {
  runId: string;
  chatId: string;
  nodeId: string;
  nodeType: import('./network').NodeType;
  phase: TracePhase;
  branch?: string;
  agentRunId?: string;
};

export type ChatRunStatus = 'complete' | 'failed' | 'cancelled';

export type ChatRunResultEvent = {
  runId: string;
  chatId: string;
  status: ChatRunStatus;
  result?: import('./chat').ChatRunResult;
  error?: string;
};

export type ClientMessage =
  | { type: 'hello'; payload?: { clientVersion?: string } }
  | { type: 'ping'; payload?: { t?: number } }
  | { type: 'subscribe'; payload: { chatId: string } }
  | { type: 'unsubscribe'; payload: { chatId: string } };

export type ServerMessage =
  | { type: 'welcome'; payload: { serverTime: string } }
  | { type: 'pong'; payload: { t: number } }
  | { type: 'error'; payload: { code: string; message?: string } }
  | { type: 'agent_trace'; payload: AgentTracePayload }
  | { type: 'network_step'; payload: NetworkStepEvent }
  | { type: 'run_result'; payload: ChatRunResultEvent };

export interface ReasoningStepUi {
  id: string;
  type: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  label: string;
  description?: string;
}

export type NetworkStepUiStatus = 'pending' | 'active' | 'complete';

export type RealtimeStatus = 'idle' | 'connecting' | 'open' | 'closed';

export interface NetworkStepUi {
  id: string;
  nodeId: string;
  nodeType: import('./network').NodeType;
  status: NetworkStepUiStatus;
  branch?: string;
  agentRunId?: string;
  agentSteps: ReasoningStepUi[];
}
