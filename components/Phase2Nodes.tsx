'use client';

import { useCallback, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Video, Film, Megaphone, Upload, CheckCircle2, Loader2 } from 'lucide-react';

const baseNode = 'rounded-xl border shadow-lg text-white text-xs font-sans min-w-[180px] overflow-hidden';
const header = (color: string) => `${color} px-3 py-2 flex items-center gap-2 font-semibold text-sm`;
const body = 'bg-gray-900 p-3';

interface UploadVideoData {
  videoUrl?: string;
  videoName?: string;
  onVideoUpload?: (dataUrl: string, name: string) => void;
}

export function UploadVideoNode({ data }: { data: UploadVideoData }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>(data.videoName ?? '');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(!!data.videoUrl);
  const [fileSize, setFileSize] = useState<string>('');

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setLoading(true);

      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      setFileSize(`${sizeMB} MB`);
      setName(file.name);

      // Read file as base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReady(true);
        setLoading(false);
        data.onVideoUpload?.(result, file.name);
      };
      reader.onerror = () => setLoading(false);
      reader.readAsDataURL(file);
    },
    [data]
  );

  return (
    <div className={`${baseNode} border-blue-700 w-52`}>
      <div className={header('bg-blue-800')}>
        <Video size={14} /> Upload Video
      </div>
      <div className={body}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
            dragging ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600 hover:border-blue-500'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 size={18} className="text-blue-400 animate-spin" />
              <span className="text-blue-400 text-[10px]">Reading video…</span>
            </div>
          ) : ready ? (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={20} className="text-green-400" />
              <span className="text-green-400 text-xs truncate max-w-[130px]">{name}</span>
              {fileSize && <span className="text-gray-500 text-[10px]">{fileSize}</span>}
            </div>
          ) : (
            <>
              <Upload size={18} className="mx-auto mb-1 text-blue-400" />
              <p className="text-gray-400 text-[10px]">Drop video here</p>
              <p className="text-gray-600 text-[10px]">mp4 · mov · webm</p>
              <p className="text-yellow-600 text-[10px] mt-1">⚠ Keep under 10MB</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      <Handle type="source" position={Position.Right} id="default" className="!bg-blue-400" />
    </div>
  );
}
interface ExtractFrameData {
  timestamp?: number;
  frameUrl?: string;
  onTimestampChange?: (ts: number) => void;
}

export function ExtractFrameNode({ data }: { data: ExtractFrameData }) {
  const [ts, setTs] = useState<number>(data.timestamp ?? 50);

  const handleChange = (val: number) => {
    setTs(val);
    data.onTimestampChange?.(val);
  };

  return (
    <div className={`${baseNode} border-indigo-700 w-52`}>
      <Handle type="target" position={Position.Left} id="default" className="!bg-indigo-400" />
      <div className={header('bg-indigo-800')}>
        <Film size={14} /> Extract Frame
      </div>
      <div className={body}>
        <label className="text-gray-400 text-[10px] mb-1 block">
          Timestamp: <span className="text-white">{ts}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={ts}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
        <p className="text-gray-600 text-[10px] mt-1">
          {ts === 50 ? 'Mid-video frame (default)' : ts === 0 ? 'First frame' : ts === 100 ? 'Last frame' : `${ts}% through video`}
        </p>
        {data.frameUrl && (
          <div className="mt-2 rounded overflow-hidden border border-indigo-700">
            <img src={data.frameUrl} alt="Extracted frame" className="w-full object-cover max-h-24" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="default" className="!bg-indigo-400" />
    </div>
  );
}
interface MarketingOutputData {
  text?: string;
}

export function MarketingOutputNode({ data }: { data: MarketingOutputData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data.text) {
      navigator.clipboard.writeText(data.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${baseNode} border-pink-700 w-64`}>
      <Handle type="target" position={Position.Left} id="default" className="!bg-pink-400" />
      <div className={header('bg-gradient-to-r from-pink-800 to-purple-800')}>
        <Megaphone size={14} /> Marketing Post
      </div>
      <div className={body}>
        {data.text ? (
          <>
            <div className="bg-gray-800 rounded-lg p-3 border border-pink-700/40 leading-relaxed text-gray-200 text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
              {data.text}
            </div>
            <button
              onClick={handleCopy}
              className={`mt-2 w-full py-1.5 rounded text-[11px] font-medium transition-all ${
                copied ? 'bg-green-600 text-white' : 'bg-pink-700 hover:bg-pink-600 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy Post'}
            </button>
          </>
        ) : (
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-dashed border-pink-700/40">
            <Megaphone size={18} className="mx-auto mb-1 text-pink-500 opacity-50" />
            <p className="text-gray-500 text-[10px]">Marketing post will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}