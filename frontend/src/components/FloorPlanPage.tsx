// src/components/FloorPlanPage.tsx
import React from 'react';
import FloorPlan from './FloorPlan/FloorPlan';

const FloorPlanPage: React.FC = () => {
  return (
    <div>
      <h1>Floor Plan Editor</h1>
      <FloorPlan /> {/* Integrating the FloorPlan component */}
    </div>
  );
};

export default FloorPlanPage;
