'use client';

/**
 * FlowCanvas — Full Integration
 * Phase 1  : Upload Image → Crop → LLM #1 (product description)
 * Phase 2  : Upload Video → Extract Frame
 * Branch 3 : LLM #2 (system_prompt + description + video frame) → Marketing Output
 *
 * All Phase 1 logic is UNTOUCHED.
 * Phase 2 + Branch 3 nodes are wired in as additional parallel branches.
 */

import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Phase 1 nodes (unchanged) ──
import {
  InputNode,
  ModelNode,
  OutputNode,
  CropNode,
  UploadNode,
  TextNode,
  DescriptionNode,
  LLMNode,
} from './CustomNodes';

// ── Phase 2 + Branch 3 nodes (NEW) ──
import { UploadVideoNode, ExtractFrameNode, MarketingOutputNode } from './Phase2Nodes';

import Sidebar from './Sidebar';
import WorkflowHistory from './WorkflowHistory';
import { useWorkflowHistory } from '@/hooks/useWorkflowHistory';
import { Play } from 'lucide-react';

/* ── Register all node types ── */
const nodeTypes = {
  // Phase 1
  input: InputNode,
  model: ModelNode,
  output: OutputNode,
  crop: CropNode,
  upload: UploadNode,
  text: TextNode,
  description: DescriptionNode,
  llm: LLMNode,
  // Phase 2 + Branch 3
  uploadVideo: UploadVideoNode,
  extractFrame: ExtractFrameNode,
  marketingOutput: MarketingOutputNode,
};

let id = 20; // start above Phase 1 IDs
const getId = () => `${id++}`;

/** Input requirements per node type */
const NODE_INPUTS: Record<string, string[]> = {
  // Phase 1
  upload: [],
  crop: ['default'],
  text: [],
  input: [],
  llm: ['system_prompt', 'user_message', 'image'],
  output: ['default'],
  model: ['default'],
  description: ['default'],
  // Phase 2
  uploadVideo: [],
  extractFrame: ['default'],
  // Branch 3 convergence LLM — reuse 'llm' type but with llm2 id convention
  // marketingOutput
  marketingOutput: ['default'],
};

type NodeOutputs = Map<string, string | null>;

/* ─────────────────────────────────────────
   INITIAL LAYOUT
   Phase 1: y=50–450   (left columns)
   Phase 2: y=500–700  (bottom left)
   Branch 3: x=900+    (right column)
───────────────────────────────────────── */
const initialNodes: Node[] = [
  // ── PHASE 1: Image Branch ──
  { id: 'upload-1',   type: 'upload',   position: { x: 50,  y: 50  }, data: { imageUrl: '' } },
  { id: 'crop-1',     type: 'crop',     position: { x: 280, y: 80  }, data: { width: 512, height: 512 } },
  { id: 'text-sys',   type: 'text',     position: { x: 50,  y: 250 }, data: { text: '', textType: 'system_prompt' } },
  { id: 'text-prod',  type: 'text',     position: { x: 50,  y: 400 }, data: { text: '', textType: 'product_details' } },
  { id: 'llm-1',      type: 'llm',      position: { x: 520, y: 200 }, data: {} },
  { id: 'output-1',   type: 'output',   position: { x: 760, y: 200 }, data: {} },

  // ── PHASE 2: Video Branch ──
  { id: 'upload-video-1', type: 'uploadVideo',  position: { x: 50,  y: 580 }, data: { videoUrl: '', videoName: '' } },
  { id: 'extract-1',      type: 'extractFrame', position: { x: 280, y: 590 }, data: { timestamp: 50, frameUrl: '' } },

  // ── BRANCH 3: Convergence ──
  // Text node for marketing system prompt
  { id: 'text-marketing', type: 'text', position: { x: 520, y: 500 }, data: { text: '', textType: 'system_prompt' } },
  // LLM #2 — takes: system_prompt (text-marketing), user_message (output of llm-1), image (extract-1 frame)
  { id: 'llm-2',          type: 'llm',  position: { x: 760, y: 480 }, data: {} },
  // Final marketing output
  { id: 'marketing-out',  type: 'marketingOutput', position: { x: 1010, y: 490 }, data: { text: '' } },
];

const initialEdges: Edge[] = [
  // Phase 1 edges (UNCHANGED)
  { id: 'e-upload-crop',   source: 'upload-1',  target: 'crop-1',  type: 'smoothstep' },
  { id: 'e-textsys-llm',   source: 'text-sys',  target: 'llm-1',   targetHandle: 'system_prompt', type: 'smoothstep' },
  { id: 'e-textprod-llm',  source: 'text-prod', target: 'llm-1',   targetHandle: 'user_message',  type: 'smoothstep' },
  { id: 'e-crop-llm',      source: 'crop-1',    target: 'llm-1',   targetHandle: 'image',         type: 'smoothstep' },
  { id: 'e-llm-output',    source: 'llm-1',     target: 'output-1',                               type: 'smoothstep' },

  // Phase 2 edges
  { id: 'e-video-extract', source: 'upload-video-1', target: 'extract-1', type: 'smoothstep' },

  // Branch 3 convergence edges
  // system_prompt: marketing text node → llm-2
  { id: 'e-mktg-sys-llm2',  source: 'text-marketing', target: 'llm-2', targetHandle: 'system_prompt', type: 'smoothstep' },
  // user_message: llm-1 output (product description) → llm-2
  { id: 'e-llm1-llm2-msg',  source: 'llm-1',          target: 'llm-2', targetHandle: 'user_message',  type: 'smoothstep' },
  // image: extracted video frame → llm-2
  { id: 'e-frame-llm2',     source: 'extract-1',       target: 'llm-2', targetHandle: 'image',         type: 'smoothstep' },
  // llm-2 → marketing output
  { id: 'e-llm2-mktg',      source: 'llm-2',           target: 'marketing-out',                        type: 'smoothstep' },
];

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<{
    screenToFlowPosition: (p: { x: number; y: number }) => { x: number; y: number };
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | undefined>();

  const { runs, startRun, startNodeExecution, completeNodeExecution, completeRun } =
    useWorkflowHistory();

  const handleLoadWorkflow = useCallback(
    (workflow: { id: string; nodes: Node[]; edges: Edge[] }) => {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      setCurrentWorkflowId(workflow.id);
    },
    [setNodes, setEdges]
  );

  const sanitizeNodes = (nodes: Node[]) => {
  return nodes.map((node) => {
    const cleanData = { ...node.data };

    // Remove heavy fields
    delete cleanData.imageUrl;
    delete cleanData.videoUrl;
    delete cleanData.frameUrl;

    return {
      ...node,
      data: cleanData,
    };
  });
};

const autoSaveWorkflow = async () => {
  try {
    // 🔥 REMOVE HEAVY DATA BEFORE SAVE
    const sanitizedNodes = nodes.map((node) => {
      const cleanData = { ...node.data };

      // Remove heavy fields
      delete cleanData.imageUrl;
      delete cleanData.videoUrl;
      delete cleanData.frameUrl;
      delete cleanData.generatedText;

      return {
        ...node,
        data: cleanData,
      };
    });

    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Workflow ${new Date().toLocaleTimeString()}`,
        nodes: sanitizedNodes,
        edges,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Save error:", data);
      return;
    }

    if (!activeWorkflowId && data.workflow?.id) {
      setActiveWorkflowId(data.workflow.id);
    }

    console.log("Workflow auto-saved ✅");
  } catch (err) {
    console.error("Auto save failed:", err);
  }
};
  const getIncomingEdges = useCallback(
    (nodeId: string) => edges.filter((e) => e.target === nodeId),
    [edges]
  );

  const getRequiredInputs = useCallback((nodeType: string): string[] => {
    return NODE_INPUTS[nodeType] ?? ['default'];
  }, []);

  const hasAllInputs = useCallback(
    (node: Node, outputs: NodeOutputs): boolean => {
      const required = getRequiredInputs(node.type ?? 'default');
      const incoming = getIncomingEdges(node.id);
      for (const handleId of required) {
        const edge = incoming.find((e) => (e.targetHandle ?? 'default') === handleId);
        if (!edge) return false;
        if (!outputs.has(edge.source)) return false;
        const val = outputs.get(edge.source);
        if (val === undefined || (val === null && node.type !== 'output' && node.type !== 'marketingOutput')) return false;
      }
      return true;
    },
    [getIncomingEdges, getRequiredInputs]
  );

  const getInputsForNode = useCallback(
    (node: Node, outputs: NodeOutputs): Record<string, string | null> => {
      const incoming = getIncomingEdges(node.id);
      const inputs: Record<string, string | null> = {};
      for (const edge of incoming) {
        const handleId = (edge.targetHandle as string) ?? 'default';
        inputs[handleId] = outputs.get(edge.source) ?? null;
      }
      return inputs;
    },
    [getIncomingEdges]
  );
  const cropImage = async (imageBase64: string, cropData: { width?: number; height?: number }) => {
    const response = await fetch('/api/crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, width: cropData.width || 512, height: cropData.height || 512 }),
    });
    if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Crop failed'); }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const processTextNode = async (textData: { text?: string; textType?: string }) => {
    const response = await fetch('/api/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textData.text || '', type: textData.textType || 'product_details' }),
    });
    if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Text processing failed'); }
    const data = (await response.json()) as { text?: string };
    return data.text ?? null;
  };

  const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateDescription = async (params: {
    system_prompt: string;
    user_message: string;
    imageUrl: string;
  }): Promise<string> => {
    const payload: {
      system_prompt: string;
      user_message: string;
      imageUrl?: string;
      imageBase64?: string;
    } = { system_prompt: params.system_prompt, user_message: params.user_message };

    if (params.imageUrl.startsWith('http://') || params.imageUrl.startsWith('https://')) {
      payload.imageUrl = params.imageUrl;
    } else if (params.imageUrl.startsWith('blob:') || params.imageUrl.startsWith('data:')) {
      payload.imageBase64 = params.imageUrl.startsWith('data:')
        ? params.imageUrl
        : await blobUrlToBase64(params.imageUrl);
    }

    const response = await fetch('/api/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Failed to generate description'); }
    const data = (await response.json()) as { description?: string };
    return data.description ?? '';
  };
  const extractFrameFromVideo = async (
    videoDataUrl: string,
    timestamp: number
  ): Promise<string | null> => {
    const response = await fetch('/api/extract-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoBase64: videoDataUrl, timestamp }),
    });
    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.error || 'Frame extraction failed');
    }
    const data = (await response.json()) as { frameBase64?: string };
    return data.frameBase64 ?? null;
  };
  const executeNode = async (
    node: Node,
    inputs: Record<string, string | null>,
    outputs: NodeOutputs,
    setNodes: (fn: (nds: Node[]) => Node[]) => void,
    runId: string
  ): Promise<string | null> => {
    const nodeData = node.data as Record<string, unknown>;
    startNodeExecution(runId, node.id, node.id, node.type ?? 'unknown', inputs);

    try {
      let result: string | null = null;

      switch (node.type) {
        case 'upload':
          result = (nodeData.imageUrl as string) ?? null;
          break;

        case 'crop': {
          const img = inputs['default'] ?? inputs['image'] ?? null;
          if (!img) { result = null; break; }
          result = await cropImage(img, {
            width: (nodeData.width as number) ?? 512,
            height: (nodeData.height as number) ?? 512,
          });
          break;
        }

        case 'text':
          result = await processTextNode({
            text: (nodeData.text as string) ?? '',
            textType: (nodeData.textType as string) ?? 'product_details',
          });
          break;

        case 'input':
          result = (nodeData.text as string) ?? null;
          break;

        case 'llm': {
          const system_prompt = inputs['system_prompt'] ?? '';
          const user_message  = inputs['user_message']  ?? '';
          const imageUrl      = inputs['image']          ?? '';

          if (!system_prompt || !user_message || !imageUrl) {
            throw new Error('LLM node requires system_prompt, user_message, and image');
          }

          const description = await generateDescription({ system_prompt, user_message, imageUrl });

          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, generatedText: description } } : n
            )
          );
          result = description;
          break;
        }

        case 'output': {
          const text = inputs['default'] ?? null;
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, text: text ?? '' } } : n
            )
          );
          result = text;
          break;
        }

        case 'model': {
          const prompt = inputs['default'] ?? '';
          if (!prompt) { result = null; break; }
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, model: nodeData.model }),
          });
          const data = (await response.json()) as { error?: string; imageUrl?: string };
          if (!response.ok) throw new Error(data.error);
          result = data.imageUrl ?? null;
          break;
        }

        case 'description':
          result = inputs['default'] ?? null;
          break;

        case 'uploadVideo':
          result = (nodeData.videoUrl as string) ?? null;
          break;

        case 'extractFrame': {
          const videoDataUrl = inputs['default'] ?? null;
          if (!videoDataUrl) { result = null; break; }
          const ts = (nodeData.timestamp as number) ?? 50;
          const frameBase64 = await extractFrameFromVideo(videoDataUrl, ts);
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, frameUrl: frameBase64 ?? '' } } : n
            )
          );
          result = frameBase64;
          break;
        }
        case 'marketingOutput': {
          const text = inputs['default'] ?? null;
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, text: text ?? '' } } : n
            )
          );
          result = text;
          break;
        }

        default:
          result = inputs['default'] ?? null;
      }

      completeNodeExecution(runId, node.id, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      completeNodeExecution(runId, node.id, null, errorMessage);
      throw error;
    }
  };
  const runGraph = useCallback(async () => {
    const runId = startRun();
    const outputs: NodeOutputs = new Map();
    const executed = new Set<string>();
    const allNodes = [...nodes];

    try {
      let changed = true;
      while (changed) {
        changed = false;
        for (const node of allNodes) {
          if (executed.has(node.id)) continue;
          if (!hasAllInputs(node, outputs)) continue;
          const inputs = getInputsForNode(node, outputs);
          const output = await executeNode(node, inputs, outputs, setNodes, runId);
          outputs.set(node.id, output);
          executed.add(node.id);
          changed = true;
        }
      }
      completeRun(runId, 'success');
      await autoSaveWorkflow();

    } catch (error) {
      completeRun(runId, 'failed');
      throw error;
    }

    return outputs;
  }, [nodes, hasAllInputs, getInputsForNode, setNodes, startRun, completeRun, startNodeExecution, completeNodeExecution]);
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const uploadNode = nodes.find((n) => n.type === 'upload');
      const uploadImageUrl = (uploadNode?.data as { imageUrl?: string })?.imageUrl;

      if (!uploadNode || !uploadImageUrl) {
        setError('Phase 1: Upload a product image first');
        return;
      }

      const videoNode  = nodes.find((n) => n.type === 'uploadVideo');
      const videoUrl   = (videoNode?.data as { videoUrl?: string })?.videoUrl;
      if (!videoNode || !videoUrl) {
        setError('Phase 2: Upload a product video (Branch B)');
        return;
      }

      const textSys  = nodes.find((n) => n.type === 'text' && (n.data as { textType?: string })?.textType === 'system_prompt' && n.id === 'text-sys');
      const textProd = nodes.find((n) => n.type === 'text' && (n.data as { textType?: string })?.textType === 'product_details');
      const textMktg = nodes.find((n) => n.id === 'text-marketing');
      const llmNode  = nodes.find((n) => n.type === 'llm' && n.id === 'llm-1');

      const hasTextSys  = textSys  && String((textSys.data  as { text?: string })?.text ?? '').trim();
      const hasTextProd = textProd && String((textProd.data as { text?: string })?.text ?? '').trim();
      const hasTextMktg = textMktg && String((textMktg.data as { text?: string })?.text ?? '').trim();

      if (!llmNode || !hasTextSys || !hasTextProd) {
        setError('Phase 1: Fill in System Prompt + Product Details text nodes');
        return;
      }

      if (!hasTextMktg) {
        setError('Branch 3: Fill in the Marketing System Prompt text node');
        return;
      }

      await runGraph();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, runGraph]);
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = getId();

      const dataMap: Record<string, Record<string, unknown>> = {
        upload: { imageUrl: '', onFileUpload: (dataUrl: string) => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, imageUrl: dataUrl } } : n)) },
        crop: { width: 512, height: 512, onCropChange: (p: { width?: number; height?: number }) => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, ...p } } : n)) },
        text: { text: '', textType: 'product_details' as const, onTextChange: (text: string) => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, text } } : n)), onTextTypeChange: (textType: 'system_prompt' | 'product_details') => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, textType } } : n)) },
        input: { text: '', onChange: (text: string) => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, text } } : n)) },
        description: { generatedText: '' },
        llm: {},
        // Phase 2
        uploadVideo: { videoUrl: '', videoName: '', onVideoUpload: (dataUrl: string, name: string) => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, videoUrl: dataUrl, videoName: name } } : n)) },
        extractFrame: { timestamp: 50, frameUrl: '', onTimestampChange: (ts: number) => setNodes((nds) => nds.map((n) => n.id === newNodeId ? { ...n, data: { ...n.data, timestamp: ts } } : n)) },
        marketingOutput: { text: '' },
      };

      const newNode: Node = {
        id: newNodeId,
        type: type as string,
        position: position ?? { x: 0, y: 0 },
        data: (dataMap[type] ?? {}) as Record<string, unknown>,
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const nodesWithCallbacks = nodes.map((node) => {
    const d = node.data as Record<string, unknown>;

    if (node.type === 'upload' && !d.onFileUpload) {
      return { ...node, data: { ...d, onFileUpload: (dataUrl: string) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, imageUrl: dataUrl } } : n)) } };
    }
    if (node.type === 'crop' && !d.onCropChange) {
      return { ...node, data: { ...d, onCropChange: (params: { width?: number; height?: number }) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, ...params } } : n)) } };
    }
    if (node.type === 'text' && !d.onTextChange) {
      return { ...node, data: { ...d, onTextChange: (text: string) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, text } } : n)), onTextTypeChange: (textType: 'system_prompt' | 'product_details') => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, textType } } : n)) } };
    }
    if (node.type === 'uploadVideo' && !d.onVideoUpload) {
      return { ...node, data: { ...d, onVideoUpload: (dataUrl: string, name: string) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, videoUrl: dataUrl, videoName: name } } : n)) } };
    }
    if (node.type === 'extractFrame' && !d.onTimestampChange) {
      return { ...node, data: { ...d, onTimestampChange: (ts: number) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, timestamp: ts } } : n)) } };
    }
    return node;
  });

  return (
    <div className="flex h-screen">
       <Sidebar onLoadWorkflow={handleLoadWorkflow} />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-3 flex justify-between items-center border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Linq<span className="text-violet-600">AI</span>
            </h2>
            {error && <div className="text-red-400 text-xs mt-0.5">{error}</div>}
          </div>

          {/* Phase badges */}
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-violet-900/60 text-violet-300 border border-violet-700 px-2 py-1 rounded">
              Branch A: Image
            </span>
            <span className="bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-1 rounded">
              Branch B: Video
            </span>
            <span className="bg-pink-900/60 text-pink-300 border border-pink-700 px-2 py-1 rounded">
              Branch C: Marketing ✦
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-6 py-2 rounded-lg flex gap-2 items-center text-white text-sm font-medium transition-all"
          >
            <Play size={16} />
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 bg-gray-950">
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-black"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#ffffff15" />
          </ReactFlow>
        </div>
      </div>

     <WorkflowHistory runs={runs} workflowId={currentWorkflowId} />
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}