import React from "react";
import "./TopNav.css";

export default function TopNav({ activeView, onViewChange }) {
  return (
    <header className="top-nav">
      <span 
        className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
        onClick={() => onViewChange('home')}
      >
        Home
      </span>
      <span className="nav-sep">|</span>
      <span 
        className={`nav-item ${activeView === 'forYou' ? 'active' : ''}`}
        onClick={() => onViewChange('forYou')}
      >
        For You
      </span>
    </header>
  );
}