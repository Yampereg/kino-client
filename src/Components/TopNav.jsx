/* src/Components/TopNav.jsx */
import React, { useState, useEffect, useRef } from "react";
import "./TopNav.css";

export default function TopNav({ activeView, onViewChange }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollableRef = useRef(null);

  useEffect(() => {
    // Find the scrollable container
    const findScrollContainer = () => {
      // For ForYou page, find the content-scroll-area
      const forYouScroll = document.querySelector('.content-scroll-area');
      if (forYouScroll) return forYouScroll;
      
      // Default to window
      return window;
    };

    const handleScroll = (e) => {
      const target = e.target === document ? window : e.target;
      const currentScrollY = target.scrollTop || window.scrollY;
      
      // Show nav when at top, hide when scrolling down
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        // Scrolling down & past threshold - HIDE
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - SHOW
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const scrollContainer = findScrollContainer();
    
    if (scrollContainer === window) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      scrollableRef.current = scrollContainer;
    }
    
    return () => {
      if (scrollContainer === window) {
        window.removeEventListener('scroll', handleScroll);
      } else if (scrollableRef.current) {
        scrollableRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollY, activeView]);

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