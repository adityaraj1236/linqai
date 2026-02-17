// types/workflow-history.ts

export type ExecutionStatus = 'success' | 'failed' | 'partial' | 'running';

export interface NodeExecutionRecord {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: ExecutionStatus;
  inputsUsed: Record<string, any>;
  outputsGenerated: any;
  executionTime: number; // milliseconds
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  error?: string;
}

export interface WorkflowRunEntry {
  runId: string;
  timestamp: string; // ISO timestamp
  status: ExecutionStatus;
  duration: number; // seconds
  totalNodes: number;
  successfulNodes: number;
  failedNodes: number;
  nodeExecutions: NodeExecutionRecord[];
  scope: 'full' | 'single' | 'selected'; // full workflow, single node, or selected nodes
}

export interface WorkflowHistory {
  workflowId: string;
  workflowName: string;
  runs: WorkflowRunEntry[];
  createdAt: string;
  updatedAt: string;
}