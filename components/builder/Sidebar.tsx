"use client";
export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData("nodeType", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-60 border-r p-4 space-y-4 bg-white">
      <h2 className="font-bold text-lg">Nodes</h2>

      <div
        draggable
        onDragStart={(e) => onDragStart(e, "text")}
        className="p-3 border rounded cursor-grab shadow-sm"
      >
        Text Node
      </div>

      <div
        draggable
        onDragStart={(e) => onDragStart(e, "api")}
        className="p-3 border rounded cursor-grab shadow-sm"
      >
        API Node
      </div>
    </div>
  );
}
