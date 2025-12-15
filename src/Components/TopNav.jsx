/* src/Components/TopNav.jsx */
import React, { useState, useEffect } from "react";
import "./TopNav.css";

export default function TopNav({ activeView, onViewChange }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when at top, hide when scrolling down
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header className={`top-nav ${!isVisible ? 'hidden' : ''}`}>
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