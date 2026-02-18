'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Clock, CheckCircle2, XCircle, Loader2, ChevronRight, ChevronDown,
  RefreshCw, History, Image, Video, Crop, Film, FileText, Sparkles,
  Upload, Megaphone, Settings, RotateCcw,
} from 'lucide-react';
import { WorkflowRun } from '@/hooks/useWorkflowHistory';
import { Node, Edge } from '@xyflow/react';

interface NodeRunDB {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  durationMs?: number;
  output?: string | null;
  errorMsg?: string | null;
}

interface RunDB {
  id: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt: string;
  totalMs?: number;
  workflowId?: string | null;
  nodeRuns: NodeRunDB[];
}

function timeAgo(d: string | Date) {
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function fmtMs(ms?: number) {
  if (!ms) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

const nodeIcons: Record<string, any> = {
  upload: Upload, uploadVideo: Video, crop: Crop, extractFrame: Film,
  text: FileText, llm: Sparkles, output: Image, marketingOutput: Megaphone,
};

// ── Props ────────────────────────────────────────────────────
interface Props {
  runs: WorkflowRun[];
  workflowId?: string;
  onLoadWorkflow: (nodes: Node[], edges: Edge[], workflowId: string) => void;
  onRestoreOutputs: (nodeOutputs: Record<string, string | null>) => void;
}

// ── DBRunRow ─────────────────────────────────────────────────
function DBRunRow({
  run,
  onLoadWorkflow,
  onRestoreOutputs,
}: {
  run: RunDB;
  onLoadWorkflow: Props['onLoadWorkflow'];
  onRestoreOutputs: Props['onRestoreOutputs'];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const statusColor =
    run.status === 'SUCCESS' ? 'text-green-400 bg-green-900/20 border-green-800/40'
    : run.status === 'FAILED' ? 'text-red-400 bg-red-900/20 border-red-800/40'
    : 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40';

  const handleLoad = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      // PATH A — has saved workflow → load full nodes + edges
      if (run.workflowId) {
        const res = await fetch(`/api/workflows/${run.workflowId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.workflow) {
            onLoadWorkflow(data.workflow.nodes, data.workflow.edges, data.workflow.id);
            setDone(true);
            setTimeout(() => setDone(false), 2500);
            return;
          }
        }
      }

      // PATH B — no saved workflow → patch existing nodes with outputs from nodeRuns
      const outputMap: Record<string, string | null> = {};
      run.nodeRuns.forEach(nr => { outputMap[nr.nodeId] = nr.output ?? null; });
      onRestoreOutputs(outputMap);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-800/50 last:border-0">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        {/* status icon */}
        {run.status === 'SUCCESS' ? <CheckCircle2 size={12} className="text-green-400 shrink-0" />
         : run.status === 'FAILED' ? <XCircle size={12} className="text-red-400 shrink-0" />
         : <Loader2 size={12} className="text-yellow-400 animate-spin shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${statusColor}`}>
              {run.status}
            </span>
            <span className="text-gray-500 text-[10px]">{run.nodeRuns.length} nodes</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-500 text-[10px] flex items-center gap-1">
              <Clock size={9} /> {timeAgo(run.startedAt)}
            </span>
            <span className="text-gray-600 text-[10px]">{fmtMs(run.totalMs)}</span>
          </div>
        </div>

        {/* ✅ LOAD BUTTON — always shown, no condition on workflowId */}
        <button
          onClick={handleLoad}
          disabled={loading}
          title="Restore this run on canvas"
          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-all
            ${done
              ? 'bg-green-900/40 text-green-400 border-green-700'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-violet-900/50 hover:text-violet-300 hover:border-violet-600'
            }`}
        >
          {loading ? <Loader2 size={10} className="animate-spin" />
           : done   ? <CheckCircle2 size={10} />
           : <RotateCcw size={10} />}
          {done ? 'Done!' : 'Load'}
        </button>

        {open ? <ChevronDown size={11} className="shrink-0 text-gray-500" />
               : <ChevronRight size={11} className="shrink-0 text-gray-500" />}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="px-3 pb-2 space-y-1">
          {run.nodeRuns.map(nr => {
            const Icon = nodeIcons[nr.nodeType] ?? Settings;
            return (
              <div key={nr.id} className="flex items-start gap-2 bg-gray-800/40 rounded-lg px-2.5 py-1.5">
                <Icon size={13} className="text-violet-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium ${
                      nr.status === 'SUCCESS' ? 'text-green-400'
                      : nr.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'
                    }`}>{nr.nodeLabel || nr.nodeId}</span>
                    <span className="text-gray-600 text-[10px]">{fmtMs(nr.durationMs)}</span>
                  </div>
                  {nr.output && (
                    <p className="text-gray-400 text-[10px] mt-0.5 line-clamp-2">
                      {nr.output.slice(0, 120)}{nr.output.length > 120 ? '…' : ''}
                    </p>
                  )}
                  {nr.errorMsg && (
                    <p className="text-red-400 text-[10px] mt-0.5 truncate">{nr.errorMsg.slice(0, 80)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MemRunRow (in-memory, not yet saved) ─────────────────────
function MemRunRow({ run }: { run: WorkflowRun }) {
  const color =
    run.status === 'success' ? 'text-green-400 bg-green-900/20 border-green-800/40'
    : run.status === 'failed' ? 'text-red-400 bg-red-900/20 border-red-800/40'
    : 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40';
  return (
    <div className="border-b border-gray-800/50 last:border-0 opacity-40">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {run.status === 'running' ? <Loader2 size={12} className="text-yellow-400 animate-spin shrink-0" />
         : run.status === 'success' ? <CheckCircle2 size={12} className="text-green-400 shrink-0" />
         : <XCircle size={12} className="text-red-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${color}`}>
            {run.status.toUpperCase()}
          </span>
          <p className="text-gray-600 text-[10px] mt-0.5">{run.nodeExecutions.length} nodes · saving…</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function WorkflowHistory({ runs: memRuns, workflowId, onLoadWorkflow, onRestoreOutputs }: Props) {
  const [dbRuns, setDbRuns] = useState<RunDB[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const url = workflowId ? `/api/runs?workflowId=${workflowId}&limit=20` : '/api/runs?limit=20';
      const res = await fetch(url);
      if (res.ok) { const d = await res.json(); setDbRuns(d.runs ?? []); }
    } finally { setLoading(false); }
  }, [workflowId]);

  useEffect(() => { fetchFromDB(); }, [fetchFromDB]);

  // Auto-refresh every 5s while generating
  useEffect(() => {
    const running = memRuns.some(r => r.status === 'running');
    if (!running) return;
    const t = setInterval(fetchFromDB, 5000);
    return () => clearInterval(t);
  }, [memRuns, fetchFromDB]);

  const total = dbRuns.length + memRuns.length;

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col h-screen">
      <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={13} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Run History</span>
          {total > 0 && (
            <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{total}</span>
          )}
        </div>
        <button onClick={fetchFromDB} disabled={loading} className="text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

   {dbRuns.length > 0 && (
  <div className="px-3 py-1.5 bg-violet-950/30 border-b border-violet-900/20">
    <p className="text-[10px] text-violet-400">
      Click <strong>Load</strong> on any run to restore it on the canvas.
    </p>
  </div>
)}

      <div className="flex-1 overflow-y-auto">
        {loading && dbRuns.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={16} className="animate-spin text-gray-600" />
          </div>
        )}
        {!loading && total === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-700">
            <History size={22} />
            <p className="text-xs">No runs yet. Hit Generate!</p>
          </div>
        )}
        {dbRuns.map(r => (
          <DBRunRow
            key={r.id}
            run={r}
            onLoadWorkflow={onLoadWorkflow}
            onRestoreOutputs={onRestoreOutputs}
          />
        ))}
        {memRuns.map(r => <MemRunRow key={r.id} run={r} />)}
      </div>
    </div>
  );
}