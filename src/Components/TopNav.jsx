import React from "react";
import "./TopNav.css";

export default function TopNav() {
  return (
    <header className="top-nav">
      <span className="nav-item active">Home</span>
      <span className="nav-sep">|</span>
      <span className="nav-item">For You</span>
    </header>
  );
}
