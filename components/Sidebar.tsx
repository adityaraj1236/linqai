'use client';

import { useState, useEffect } from 'react';
import {
  FileImage,
  Sparkles,
  Image,
  Type,
  Layers,
  Droplet,
  Crop,
  MonitorPlay,
  Menu,
  X,
  Video,
  Film,
  Megaphone,
  Folder,
} from 'lucide-react';

import { Node, Edge } from '@xyflow/react';

interface SidebarProps {
  onLoadWorkflow?: (
    nodes: Node[],
    edges: Edge[],
    workflowId: string
  ) => void;
}

interface WorkflowItem {
  id: string;
  name: string;
}

const toolboxItems = [
  { id: 'upload', label: 'Upload Image', icon: FileImage, description: 'Upload product image', group: 'Branch A · Image' },
  { id: 'crop', label: 'Crop', icon: Crop, description: 'Crop image to size', group: 'Branch A · Image' },
  { id: 'input', label: 'Input', icon: FileImage, description: 'Text input', group: 'Branch A · Image' },
  { id: 'text', label: 'Text', icon: Type, description: 'System prompt / product details', group: 'Branch A · Image' },
  { id: 'llm', label: 'LLM', icon: Sparkles, description: 'Generate description', group: 'Branch A · Image' },
  { id: 'output', label: 'Output', icon: Image, description: 'View LLM results', group: 'Branch A · Image' },

  { id: 'uploadVideo', label: 'Upload Video', icon: Video, description: 'Upload video', group: 'Branch B · Video' },
  { id: 'extractFrame', label: 'Extract Frame', icon: Film, description: 'Extract frame', group: 'Branch B · Video' },

  { id: 'marketingOutput', label: 'Marketing', icon: Megaphone, description: 'Marketing output', group: 'Branch C · Marketing' },

  { id: 'model', label: 'AI Model', icon: Sparkles, description: 'Select AI model', group: 'Extras' },
  { id: 'description', label: 'Description', icon: Type, description: 'Pass-through description', group: 'Extras' },
  { id: 'merge', label: 'Merge', icon: Layers, description: 'Merge branches', group: 'Extras' },
  { id: 'compositor', label: 'Compositor', icon: Layers, description: 'Combine layers', group: 'Extras' },
  { id: 'blur', label: 'Blur', icon: Droplet, description: 'Blur effect', group: 'Extras' },
  { id: 'levels', label: 'Levels', icon: MonitorPlay, description: 'Adjust levels', group: 'Extras' },
];

export default function Sidebar({ onLoadWorkflow }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  /* ───────────── Fetch My Workflows ───────────── */
  useEffect(() => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => {
        setWorkflows(data.workflows || []);
      });
  }, []);

  const handleWorkflowClick = async (workflowId: string) => {
    const res = await fetch(`/api/workflows/${workflowId}`);
    const data = await res.json();

    if (data.workflow) {
      onLoadWorkflow?.(
        data.workflow.nodes,
        data.workflow.edges,
        data.workflow.id
      );
      setActiveWorkflowId(workflowId);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredItems = toolboxItems.filter(
    (item) =>
      !search ||
      item.label.toLowerCase().includes(search.toLowerCase())
  );

  const groups = Array.from(new Set(filteredItems.map((i) => i.group)));

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-4 z-50 bg-violet-600 text-white p-3 rounded-lg"
        >
          <Menu size={18} />
        </button>
      )}

      <div className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all ${isOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>

        {/* HEADER */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-white">
              Linq<span className="text-violet-600">AI</span>
            </h1>
            <button onClick={() => setIsOpen(false)}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Search nodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-sm text-white rounded px-3 py-2 focus:outline-none"
          />
        </div>

        {/* ───────────── MY WORKFLOWS SECTION ───────────── */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 uppercase">
            <Folder size={14} />
            My Workflows
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto">
            {workflows.length === 0 && (
              <div className="text-gray-500 text-xs">No saved workflows</div>
            )}

            {workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => handleWorkflowClick(wf.id)}
                className={`px-3 py-2 rounded cursor-pointer text-sm transition-all ${
                  activeWorkflowId === wf.id
                    ? 'bg-violet-900/40 border border-violet-500 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {wf.name}
              </div>
            ))}
          </div>
        </div>

        {/* TOOLBOX */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {groups.map((group) => {
            const items = filteredItems.filter((i) => i.group === group);
            return (
              <div key={group}>
                <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">
                  {group}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, item.id)}
                        className="bg-gray-800 border border-gray-700 hover:border-violet-500 rounded-lg p-3 cursor-grab transition-all"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon size={18} className="text-violet-400" />
                          <span className="text-[11px] text-white text-center">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
