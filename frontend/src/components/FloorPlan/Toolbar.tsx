// src/components/FloorPlan/Toolbar.tsx

import React from "react";

interface ToolbarProps {
  placingTower: boolean;
  drawingRoom: boolean;
  onToggleTowerMode: () => void;
  onToggleRoomDrawing: () => void;
  onClearCanvas: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  placingTower,
  drawingRoom,
  onToggleTowerMode,
  onToggleRoomDrawing,
  onClearCanvas,
}) => {
  return (
    <div className="toolbar">
      <button
        onClick={onToggleTowerMode}
        className={placingTower ? "active-button" : ""}
      >
        Place Tower
      </button>
      <button
        onClick={onToggleRoomDrawing}
        className={drawingRoom ? "active-button" : ""}
      >
        {drawingRoom ? "Stop Drawing Room" : "Draw Room"}
      </button>
      <button onClick={onClearCanvas}>Clear Canvas</button>
    </div>
  );
};

export default Toolbar;
