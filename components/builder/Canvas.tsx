"use client";

import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = (params: Connection) =>
    setEdges((eds: Edge[]) => addEdge(params, eds));

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("nodeType");

    const position = {
      x: event.clientX - 250,
      y: event.clientY - 80,
    };

    const newNode = {
      id: Date.now().toString(),
      position,
      data: { label: `${type} node` },
      type: "default",
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div
      className="flex-1 h-full"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
