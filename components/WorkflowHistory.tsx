'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  History,
  Image,
  Video,
  Crop,
  Film,
  FileText,
  Sparkles,
  Upload,
  Megaphone,
  Settings
} from 'lucide-react';
import { WorkflowRun } from '@/hooks/useWorkflowHistory';

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
  completedAt?: string;
  totalMs?: number;
  workflowId?: string;
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
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const nodeIcons: Record<string, any> = {
  upload: Upload,
  uploadVideo: Video,
  crop: Crop,
  extractFrame: Film,
  text: FileText,
  llm: Sparkles,
  output: Image,
  marketingOutput: Megaphone,
};

function DBRunRow({ run }: { run: RunDB }) {
  const [open, setOpen] = useState(false);

  const color =
    run.status === 'SUCCESS'
      ? 'text-green-400 bg-green-900/20 border-green-800/40'
      : run.status === 'FAILED'
      ? 'text-red-400 bg-red-900/20 border-red-800/40'
      : 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40';

  const StatusIcon =
    run.status === 'SUCCESS'
      ? <CheckCircle2 size={12} className="text-green-400" />
      : run.status === 'FAILED'
      ? <XCircle size={12} className="text-red-400" />
      : <Loader2 size={12} className="text-yellow-400 animate-spin" />;

  return (
    <div className="border-b border-gray-800/50 last:border-0">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        {StatusIcon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${color}`}>
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
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </div>

      {open && (
        <div className="px-3 pb-2 space-y-1">
          {run.nodeRuns.map(nr => {
            const Icon = nodeIcons[nr.nodeType] ?? Settings;
            return (
              <div key={nr.id} className="flex items-start gap-2 bg-gray-800/40 rounded-lg px-2.5 py-1.5">
                <Icon size={14} className="text-violet-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-medium ${
                        nr.status === 'SUCCESS'
                          ? 'text-green-400'
                          : nr.status === 'FAILED'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {nr.nodeId}
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      {fmtMs(nr.durationMs)}
                    </span>
                  </div>
                  {nr.output && (
                    <p className="text-gray-500 text-[10px] truncate">
                      {nr.output.slice(0, 60)}
                      {nr.output.length > 60 ? '…' : ''}
                    </p>
                  )}
                  {nr.errorMsg && (
                    <p className="text-red-500 text-[10px] truncate">
                      {nr.errorMsg.slice(0, 60)}
                    </p>
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

function MemRunRow({ run }: { run: WorkflowRun }) {
  const [open, setOpen] = useState(false);

  const color =
    run.status === 'success'
      ? 'text-green-400 bg-green-900/20 border-green-800/40'
      : run.status === 'failed'
      ? 'text-red-400 bg-red-900/20 border-red-800/40'
      : 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40';

  return (
    <div className="border-b border-gray-800/50 last:border-0 opacity-70">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        {run.status === 'running' ? (
          <Loader2 size={12} className="text-yellow-400 animate-spin" />
        ) : run.status === 'success' ? (
          <CheckCircle2 size={12} className="text-green-400" />
        ) : (
          <XCircle size={12} className="text-red-400" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${color}`}>
              {run.status.toUpperCase()}
            </span>
          </div>
          <span className="text-gray-600 text-[10px]">
            {run.nodeExecutions.length} nodes
          </span>
        </div>
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </div>
    </div>
  );
}

interface Props {
  runs: WorkflowRun[];
  workflowId?: string;
}

export default function WorkflowHistory({ runs: memRuns, workflowId }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [dbRuns, setDbRuns] = useState<RunDB[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const url = workflowId
        ? `/api/runs?workflowId=${workflowId}&limit=20`
        : '/api/runs?limit=20';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDbRuns(data.runs);
      }
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchFromDB();
  }, [fetchFromDB]);

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col h-screen">
      <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={13} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Run History</span>
        </div>
        <button onClick={fetchFromDB} disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {dbRuns.map(r => (
          <DBRunRow key={r.id} run={r} />
        ))}
        {memRuns.map(r => (
          <MemRunRow key={r.id} run={r} />
        ))}
      </div>
    </div>
  );
}
