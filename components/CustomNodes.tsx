'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Type, Sparkles, FileImage, Layers, Droplet, Crop as CropIcon, Sliders, MonitorPlay } from 'lucide-react';
export const TextNode = memo(({ data, selected }: NodeProps) => {
  const textType = data.textType || 'product_details';

  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[220px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Type size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Text</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Type</label>
          <select
            className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
            value={textType}
            onChange={(e) => data.onTextTypeChange?.(e.target.value as 'system_prompt' | 'product_details')}
          >
            <option value="system_prompt">System Prompt</option>
            <option value="product_details">Product Details</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            {textType === 'system_prompt' ? 'System Prompt' : 'Product Details'}
          </label>
          <textarea
            className="w-full bg-gray-700 text-white text-sm rounded p-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-600"
            placeholder={
              textType === 'system_prompt'
                ? 'You are a professional marketing copywriter...'
                : 'Product: Wireless Bluetooth Headphones. Features: Noise cancellation...'
            }
            value={data.text ?? ''}
            onChange={(e) => data.onTextChange?.(e.target.value)}
          />
        </div>
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Ready' :
             data.status === 'processing' ? '⏳ Processing...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

TextNode.displayName = 'TextNode';
export const InputNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[200px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <FileImage size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Input</span>
      </div>
      <div className="p-4">
        <textarea
          className="w-full bg-gray-700 text-white text-sm rounded p-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-600"
          placeholder="Enter your prompt or description..."
          defaultValue={data.text || ''}
          onChange={(e) => data.onChange?.(e.target.value)}
        />
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded mt-2 ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Ready' :
             data.status === 'processing' ? '⏳ Processing...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

InputNode.displayName = 'InputNode';
export const LLMNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[260px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">LLM</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="text-xs text-gray-400 space-y-1">
          <div>• System Prompt (top)</div>
          <div>• Product Details (mid)</div>
          <div>• Image (bottom)</div>
        </div>
        {data.generatedText && (
          <div className="text-xs text-gray-300 bg-gray-700 p-2 rounded max-h-[80px] overflow-y-auto">
            {data.generatedText}
          </div>
        )}
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Generated' :
             data.status === 'processing' ? '⏳ Generating...' :
             '○ Waiting for inputs'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} id="system_prompt" style={{ top: '25%' }} className="!bg-violet-600 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="user_message" style={{ top: '50%' }} className="!bg-violet-600 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="image" style={{ top: '75%' }} className="!bg-violet-600 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

LLMNode.displayName = 'LLMNode';
export const ModelNode = memo(({ data, selected }: NodeProps) => {
  const models = [
    'Pollinations AI',
    'Gemini AI',
    'Stable Diffusion XL',
    'DALL-E 3',
    'Midjourney Style',
    'Flux Pro',
  ];

  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[220px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">AI Model</span>
      </div>
      <div className="p-4 space-y-3">
        <select
          className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
          defaultValue={data.model || models[0]}
          onChange={(e) => data.onModelChange?.(e.target.value)}
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Style</label>
          <select className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600">
            <option>Realistic</option>
            <option>Artistic</option>
            <option>Anime</option>
            <option>3D Render</option>
            <option>Cinematic</option>
          </select>
        </div>
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Configured' :
             data.status === 'processing' ? '⏳ Processing...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

ModelNode.displayName = 'ModelNode';
export const OutputNode = memo(({ data, selected }: NodeProps) => {
  const outputText = (data.text as string) ?? '';

  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[280px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Type size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Output</span>
      </div>
      <div className="p-4">
        {outputText ? (
          <div className="space-y-2">
            <div className="bg-gray-700 rounded p-3 max-h-[280px] overflow-y-auto">
              <div className="text-sm text-gray-200 whitespace-pre-wrap">{outputText}</div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded text-xs"
            >
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div className="bg-gray-700 rounded h-[200px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Type size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No output yet</p>
              <p className="text-xs text-gray-600 mt-1">Click Generate to create</p>
            </div>
          </div>
        )}
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded mt-2 ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Generated' :
             data.status === 'processing' ? '⏳ Generating...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
export const UploadNode = memo(({ data, selected, id: nodeId }: NodeProps) => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      setFileName(file.name);
      data.onFileUpload?.(base64);
    };

    reader.readAsDataURL(file);
  };

  const inputId = `file-upload-${nodeId ?? 'default'}`;

  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[200px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <FileImage size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Upload</span>
      </div>
      <div className="p-4 space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-sm text-center py-2 px-3 rounded cursor-pointer transition-colors"
        >
          Choose File
        </label>
        {fileName && (
          <div className="text-xs text-gray-400 break-all">
            📁 {fileName}
          </div>
        )}
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Uploaded' :
             data.status === 'processing' ? '⏳ Uploading...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

UploadNode.displayName = 'UploadNode';
export const ExtractFrameNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[200px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <MonitorPlay size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Extract Frame</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Frame Number</label>
          <input
            type="number"
            defaultValue={data.frameNumber || 1}
            min="1"
            className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Time (seconds)</label>
          <input
            type="number"
            defaultValue={data.timeSeconds || 0}
            min="0"
            step="0.1"
            className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Extracted' :
             data.status === 'processing' ? '⏳ Extracting...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

ExtractFrameNode.displayName = 'ExtractFrameNode';
export const MergeNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[180px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Layers size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Merge</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="text-xs text-gray-400">
          Convergence Point
        </div>
        <div className="text-xs text-gray-500">
          Combines multiple branches
        </div>
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Merged' :
             data.status === 'processing' ? '⏳ Merging...' :
             '○ Waiting for inputs'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} id="input1" style={{ top: '30%' }} className="!bg-violet-600" />
      <Handle type="target" position={Position.Left} id="input2" style={{ top: '70%' }} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

MergeNode.displayName = 'MergeNode';
export const DescriptionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[220px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Type size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Description</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Type</label>
          <select className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600">
            <option>Product Description</option>
            <option>Marketing Copy</option>
            <option>SEO Description</option>
            <option>Social Media Post</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Tone</label>
          <select className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600">
            <option>Professional</option>
            <option>Casual</option>
            <option>Enthusiastic</option>
            <option>Technical</option>
          </select>
        </div>
        {data.generatedText && (
          <div className="text-xs text-gray-300 bg-gray-700 p-2 rounded max-h-[100px] overflow-y-auto">
            {data.generatedText}
          </div>
        )}
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Generated' :
             data.status === 'processing' ? '⏳ Generating...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

DescriptionNode.displayName = 'DescriptionNode';
export const MarketingSummaryNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[280px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Marketing Summary</span>
      </div>
      <div className="p-4 space-y-2">
        {data.summary ? (
          <div className="space-y-2">
            <div className="bg-gray-700 rounded p-3 max-h-[200px] overflow-y-auto">
              <div className="text-xs text-gray-300 whitespace-pre-wrap">
                {data.summary}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(data.summary);
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded text-xs"
              >
                Copy Summary
              </button>
              <button
                onClick={data.onExport}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs"
              >
                Export
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-700 rounded h-[150px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No summary yet</p>
            </div>
          </div>
        )}
        {data.status && (
          <div className={`text-xs px-2 py-1 rounded ${
            data.status === 'complete' ? 'bg-green-900/30 text-green-400' :
            data.status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {data.status === 'complete' ? '✓ Complete' :
             data.status === 'processing' ? '⏳ Generating...' :
             '○ Pending'}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
    </div>
  );
});

MarketingSummaryNode.displayName = 'MarketingSummaryNode';
export const CompositorNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[200px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Layers size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Compositor</span>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-300">Blur Background</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-300">Add Text Overlay</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-300">Apply Filter</span>
          </label>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

CompositorNode.displayName = 'CompositorNode';
export const BlurNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[200px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Droplet size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Blur</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Blur Type</label>
          <select className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600">
            <option>Gaussian Blur</option>
            <option>Motion Blur</option>
            <option>Radial Blur</option>
            <option>Box Blur</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Intensity</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="50"
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Radius (px)</label>
          <input 
            type="number" 
            defaultValue="5"
            min="0"
            max="50"
            className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

BlurNode.displayName = 'BlurNode';
export const CropNode = memo(({ data, selected }: NodeProps) => {
  const width = data.width ?? 512;
  const height = data.height ?? 512;

  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[200px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <CropIcon size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Crop</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Aspect Ratio</label>
          <select className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600">
            <option>Free</option>
            <option>1:1 (Square)</option>
            <option>16:9 (Landscape)</option>
            <option>9:16 (Portrait)</option>
            <option>4:3</option>
            <option>3:2</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Width</label>
            <input
              type="number"
              value={width}
              min={1}
              placeholder="1024"
              className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
              onChange={(e) => data.onCropChange?.({ width: Number(e.target.value) || 512, height })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Height</label>
            <input
              type="number"
              value={height}
              min={1}
              placeholder="1024"
              className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
              onChange={(e) => data.onCropChange?.({ width, height: Number(e.target.value) || 512 })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" />
          <span className="text-gray-300">Lock Aspect Ratio</span>
        </label>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

CropNode.displayName = 'CropNode';
export const LevelsNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${selected ? 'border-violet-600' : 'border-gray-700'} min-w-[220px]`}>
      <div className="bg-gray-900 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Sliders size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Levels</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Brightness</label>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            defaultValue="0"
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Contrast</label>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            defaultValue="0"
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Saturation</label>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            defaultValue="0"
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Exposure</label>
          <input 
            type="range" 
            min="-2" 
            max="2" 
            step="0.1"
            defaultValue="0"
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-2</span>
            <span>0</span>
            <span>+2</span>
          </div>
        </div>
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded transition-colors">
          Reset to Default
        </button>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600" />
    </div>
  );
});

LevelsNode.displayName = 'LevelsNode';