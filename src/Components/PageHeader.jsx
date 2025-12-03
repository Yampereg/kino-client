// src/Components/PageHeader.jsx
import React from "react";

export default function PageHeader() {
  return (
    <div className="page-header">
      <div className="greeting">
        <div className="greeting-icon">👤</div> 
        <span>Hi User</span>
      </div>
      <div className="welcome-message">Welcome back to Kino</div>
    </div>
  );
}