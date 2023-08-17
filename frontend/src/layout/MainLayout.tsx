// src/layout/MainLayout.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './MainLayout.css'

// Define the prop types
interface MainLayoutProps {
    children: React.ReactNode;
  }

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">BlueHaven</h1>
        <nav className="nav">
          <Link to="/floorplan">Floor Plan Editor</Link>
        </nav>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">© 2023 Seb Burrell</footer>
    </div>
  );
};

export default MainLayout;
