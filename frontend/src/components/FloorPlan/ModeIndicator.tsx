// src/components/FloorPlan/ModeIndicator.tsx

import React from "react";

interface ModeIndicatorProps {
  placingTower: boolean;
  drawingRoom: boolean;
}

const ModeIndicator: React.FC<ModeIndicatorProps> = ({
  placingTower,
  drawingRoom,
}) => {
  let modeText = "Normal Mode";
  if (placingTower) {
    modeText = "Tower Placement Mode";
  } else if (drawingRoom) {
    modeText = "Room Drawing Mode";
  }

  return <div className="mode-indicator">{modeText}</div>;
};

export default ModeIndicator;
