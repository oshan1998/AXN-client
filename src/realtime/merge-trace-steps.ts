import type { AgentTracePayload, AgentRunOutcome, ReasoningStepUi } from '@/types/trace';

function runDoneLabel(outcome: AgentRunOutcome): { label: string; description: string } {
  switch (outcome) {
    case 'complete':
      return { label: 'Run complete', description: '' };
    case 'max_iterations':
      return { label: 'Stopped (iteration limit)', description: 'Max iterations reached' };
    case 'cancelled':
      return { label: 'Run cancelled', description: 'Stopped by cancellation signal' };
    case 'timed_out':
      return { label: 'Run timed out', description: 'Wall-clock budget exceeded' };
    default:
      return { label: 'Run ended', description: '' };
  }
}

function completeActive(rows: ReasoningStepUi[]): ReasoningStepUi[] {
  return rows.map((row) =>
    row.status === 'active' ? { ...row, status: 'complete' as const } : row,
  );
}

function pairId(kind: string, iteration: number, key: string, runId: string): string {
  return `${runId}:${kind}:${iteration}:${key}`;
}

export function mergeAgentTraceIntoSteps(
  prev: ReasoningStepUi[],
  payload: AgentTracePayload,
): ReasoningStepUi[] {
  const { step, seq } = payload;

  const append = (
    rows: ReasoningStepUi[],
    row: Omit<ReasoningStepUi, 'status'> & Partial<Pick<ReasoningStepUi, 'status'>>,
  ): ReasoningStepUi[] => [
    ...rows,
    { ...row, status: row.status ?? 'complete' },
  ];

  switch (step) {
    case 'thought': {
      const id = pairId('thought', payload.iteration, 'thought', payload.runId);
      if (payload.phase === 'start') {
        return append(completeActive(prev), {
          id,
          type: 'thought',
          label: 'Agent reasoning',
          description: 'Consulting model…',
          status: 'active',
        });
      }
      const excerpt =
        (payload.text ?? '').length > 600
          ? `${(payload.text ?? '').slice(0, 597)}…`
          : (payload.text ?? '');
      return prev.map((row) =>
        row.id === id
          ? { ...row, status: 'complete' as const, description: excerpt || '—' }
          : row,
      );
    }
    case 'tool': {
      const id = pairId('tool', payload.iteration, payload.name, payload.runId);
      if (payload.phase === 'start') {
        return append(completeActive(prev), {
          id,
          type: 'tool',
          label: `Tool: ${payload.name}`,
          description: 'Running…',
          status: 'active',
        });
      }
      return prev.map((row) =>
        row.id === id ? { ...row, status: 'complete' as const, description: 'Finished' } : row,
      );
    }
    case 'skill': {
      const id = pairId('skill', payload.iteration, payload.name, payload.runId);
      if (payload.phase === 'start') {
        return append(completeActive(prev), {
          id,
          type: 'skill',
          label: `Skill: ${payload.name}`,
          description: 'Executing…',
          status: 'active',
        });
      }
      return prev.map((row) =>
        row.id === id ? { ...row, status: 'complete' as const, description: 'Finished' } : row,
      );
    }
    case 'skill_tool': {
      const id = pairId(
        'skill_tool',
        payload.iteration,
        `${payload.skill}/${payload.tool}`,
        payload.runId,
      );
      if (payload.phase === 'start') {
        return append(completeActive(prev), {
          id,
          type: 'skill_tool',
          label: `${payload.skill} → ${payload.tool}`,
          description: 'Calling tool…',
          status: 'active',
        });
      }
      return prev.map((row) =>
        row.id === id ? { ...row, status: 'complete' as const, description: 'Done' } : row,
      );
    }
    case 'run_done': {
      const labels = runDoneLabel(payload.outcome);
      const done = append(completeActive(prev), {
        id: `done-${seq}`,
        type: 'done',
        label: labels.label,
        description: labels.description,
      });
      return done.map((row) =>
        row.status === 'active' ? { ...row, status: 'complete' as const } : row,
      );
    }
    case 'iteration_error': {
      const excerpt =
        payload.message.length > 400
          ? `${payload.message.slice(0, 397)}…`
          : payload.message;
      return append(completeActive(prev), {
        id: pairId('iteration_error', payload.iteration, 'err', payload.runId),
        type: 'iteration_error',
        label: `Iteration ${payload.iteration} recovered`,
        description: excerpt,
        status: 'error',
      });
    }
    default:
      return prev;
  }
}
