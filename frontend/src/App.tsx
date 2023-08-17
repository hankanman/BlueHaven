// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import FloorPlanPage from './components/FloorPlanPage'; // Import the FloorPlanPage component
import './App.css'; // Import the CSS file

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Switch>
          <Route path="/floorplan" exact component={FloorPlanPage} />
          {/* Other routes */}
        </Switch>
      </MainLayout>
    </Router>
  );
};

export default App;
