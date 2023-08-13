// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Switch>
          {/* Add your routes here */}
          <Route path="/" exact>
            {/* Your home component */}
          </Route>
          {/* Other routes */}
        </Switch>
      </MainLayout>
    </Router>
  );
};

export default App;
