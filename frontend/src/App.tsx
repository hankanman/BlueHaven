// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import FloorPlanPage from './components/FloorPlanPage'; // Import the FloorPlanPage component

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Switch>
          <Route path="/floorplan" exact component={FloorPlanPage} /> {/* Add the route for the Floor Plan page */}
          {/* Other routes */}
        </Switch>
      </MainLayout>
    </Router>
  );
};

export default App;
