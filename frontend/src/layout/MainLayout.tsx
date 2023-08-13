// src/layout/MainLayout.tsx
import React from 'react';

const MainLayout: React.FC = ({ children }) => {
  return (
    <div>
      <header>BlueHaven</header>
      <main>{children}</main>
      <footer>Footer Content</footer>
    </div>
  );
};

export default MainLayout;
