import { useState } from "react";

function moveItems(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [row] = next.splice(index, 1);
  next.splice(target, 0, row);
  return next;
}

export function ReorderList({ items, onReorder, renderItem, children }) {
  const [overId, setOverId] = useState("");
  const render = renderItem || children;

  function dropOn(targetId) {
    return (event) => {
      event.preventDefault();
      event.stopPropagation();
      const sourceId = event.dataTransfer.getData("text/plain");
      setOverId("");
      if (!sourceId || sourceId === targetId) return;
      const next = items.slice();
      const from = next.findIndex((item) => item._id === sourceId);
      const to = next.findIndex((item) => item._id === targetId);
      if (from < 0 || to < 0) return;
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      onReorder(next);
    };
  }

  return (
    <div className="reorder">
      {items.map((item, index) => (
        <div className="reorder__item" key={item._id}>
          {render(item, {
            isOver: overId === item._id,
            isFirst: index === 0,
            isLast: index === items.length - 1,
            moveUp: () => onReorder(moveItems(items, index, -1)),
            moveDown: () => onReorder(moveItems(items, index, 1)),
            dragProps: {
              draggable: true,
              onDragStart: (event) => {
                event.dataTransfer.setData("text/plain", item._id);
                event.dataTransfer.effectAllowed = "move";
              }
            },
            dropProps: {
              onDragOver: (event) => {
                event.preventDefault();
                event.stopPropagation();
                setOverId(item._id);
              },
              onDragLeave: () => setOverId(""),
              onDrop: dropOn(item._id)
            }
          })}
        </div>
      ))}
    </div>
  );
}
