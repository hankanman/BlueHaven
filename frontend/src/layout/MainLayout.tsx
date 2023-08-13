// src/layout/MainLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// Define the prop types
interface MainLayoutProps {
    children: React.ReactNode;
  }

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      <header>
        <h1>BlueHaven</h1>
        <nav>
          <Link to="/floorplan">Floor Plan Editor</Link> {/* Add a link to the Floor Plan page */}
        </nav>
      </header>
      <main>{children}</main>
      <footer>Footer Content</footer>
    </div>
  );
};

export default MainLayout;
