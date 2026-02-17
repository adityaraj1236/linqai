'use client';

// hooks/useWorkflowHistory.ts
// YE POORA FILE REPLACE KARO — existing wala hatao, ye daalo

import { useState, useCallback, useRef } from 'react';

export type NodeStatus = 'idle' | 'executing' | 'success' | 'error';

export interface NodeExecution {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: NodeStatus;
  inputs?: Record<string, unknown>;
  output?: string | null;
  errorMsg?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

export interface WorkflowRun {
  id: string;
  runId: string;           // keeping for backward compat
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'success' | 'failed';
  nodeExecutions: NodeExecution[];
  totalMs?: number;
}

export function useWorkflowHistory() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [currentRun, setCurrentRun] = useState<WorkflowRun | null>(null);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const runRef = useRef<Map<string, WorkflowRun>>(new Map());

  /* ── Start a run ── */
  const startRun = useCallback((): string => {
    const runId = `run-${Date.now()}`;
    const run: WorkflowRun = {
      id: runId,
      runId,
      startedAt: new Date(),
      status: 'running',
      nodeExecutions: [],
    };
    runRef.current.set(runId, run);
    setRuns((prev) => [run, ...prev]);
    setCurrentRun(run);
    setNodeStatuses({});
    return runId;
  }, []);

  /* ── Start node execution ── */
  const startNodeExecution = useCallback((
    runId: string,
    nodeId: string,
    nodeLabel: string,
    nodeType: string,
    inputs: Record<string, unknown>
  ) => {
    const run = runRef.current.get(runId);
    if (!run) return;

    const execution: NodeExecution = {
      nodeId, nodeLabel, nodeType,
      status: 'executing',
      inputs,
      startedAt: new Date(),
    };
    run.nodeExecutions.push(execution);

    setNodeStatuses((prev) => ({ ...prev, [nodeId]: 'executing' }));
    setRuns((prev) =>
      prev.map((r) => r.id === runId ? { ...r, nodeExecutions: [...run.nodeExecutions] } : r)
    );
    setCurrentRun((prev) =>
      prev?.id === runId ? { ...prev, nodeExecutions: [...run.nodeExecutions] } : prev
    );
  }, []);

  /* ── Complete node execution ── */
  const completeNodeExecution = useCallback((
    runId: string,
    nodeId: string,
    output: string | null,
    errorMsg?: string
  ) => {
    const run = runRef.current.get(runId);
    if (!run) return;

    const ex = run.nodeExecutions.find((e) => e.nodeId === nodeId);
    if (ex) {
      ex.status = errorMsg ? 'error' : 'success';
      ex.output = output;
      ex.errorMsg = errorMsg;
      ex.completedAt = new Date();
      ex.durationMs = ex.completedAt.getTime() - ex.startedAt.getTime();
    }

    setNodeStatuses((prev) => ({ ...prev, [nodeId]: errorMsg ? 'error' : 'success' }));
    setTimeout(() => setNodeStatuses((prev) => ({ ...prev, [nodeId]: 'idle' })), 3000);

    setRuns((prev) =>
      prev.map((r) => r.id === runId ? { ...r, nodeExecutions: [...run.nodeExecutions] } : r)
    );
    setCurrentRun((prev) =>
      prev?.id === runId ? { ...prev, nodeExecutions: [...run.nodeExecutions] } : prev
    );
  }, []);

  /* ── Complete run + SAVE TO DB ── */
  const completeRun = useCallback(async (
    runId: string,
    status: 'success' | 'failed',
    workflowId?: string
  ) => {
    const run = runRef.current.get(runId);
    if (!run) return;

    const completedAt = new Date();
    const totalMs = completedAt.getTime() - run.startedAt.getTime();
    run.status = status;
    run.completedAt = completedAt;
    run.totalMs = totalMs;

    setRuns((prev) =>
      prev.map((r) => r.id === runId ? { ...r, status, completedAt, totalMs } : r)
    );
    setCurrentRun((prev) =>
      prev?.id === runId ? { ...prev, status, completedAt, totalMs } : prev
    );
    setTimeout(() => setNodeStatuses({}), 3500);

    // ── DB mein save karo ──
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflowId ?? undefined,
          status: status === 'success' ? 'SUCCESS' : 'FAILED',
          totalMs,
          nodeRuns: run.nodeExecutions.map((ne) => ({
            nodeId:    ne.nodeId,
            nodeLabel: ne.nodeLabel,
            nodeType:  ne.nodeType,
            status:
              ne.status === 'success'    ? 'SUCCESS'
              : ne.status === 'error'    ? 'FAILED'
              : ne.status === 'executing'? 'RUNNING'
              : 'SKIPPED',
            inputs:    sanitizeInputs(ne.inputs ?? {}),
            output:    ne.output ? String(ne.output).slice(0, 500) : null,
            errorMsg:  ne.errorMsg ?? null,
            durationMs: ne.durationMs,
          })),
        }),
      });

      if (res.ok) {
        // WorkflowHistory sidebar ko refresh signal bhejo
        window.dispatchEvent(new Event('workflow-run-complete'));
      } else {
        console.warn('[useWorkflowHistory] DB save failed:', res.status);
      }
    } catch (err) {
      console.warn('[useWorkflowHistory] DB save error:', err);
    }
  }, []);

  /* ── Clear history ── */
  const clearHistory = useCallback(() => {
    setRuns([]);
    setCurrentRun(null);
    setNodeStatuses({});
    runRef.current.clear();
  }, []);

  /* ── Get specific run ── */
  const getRun = useCallback((runId: string) => {
    return runs.find((r) => r.runId === runId);
  }, [runs]);

  return {
    runs,
    currentRun,
    nodeStatuses,
    startRun,
    startNodeExecution,
    completeNodeExecution,
    completeRun,
    clearHistory,
    getRun,
  };
}

/* Strip base64/blob before DB save */
function sanitizeInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(inputs)) {
    if (typeof v === 'string' && (v.startsWith('data:') || v.startsWith('blob:'))) {
      out[k] = '[binary-stripped]';
    } else {
      out[k] = v;
    }
  }
  return out;
}