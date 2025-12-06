import React from 'react';

// Assuming you have a custom hook for authentication
// Replace this with your actual auth hook if different
const useAuth = () => ({
    logout: () => {
        console.log("Logging out...");
        // Implement your actual logout logic here (e.g., clearing tokens, redirecting)
    }
}); 

export default function SettingsDrawer({ isOpen, onClose }) {
  const { logout } = useAuth();
  
  // Handle the click on the logout button
  const handleLogout = () => {
    // 1. Close the drawer immediately
    onClose(); 
    // 2. Execute logout function
    logout();
  };

  return (
    <>
      {/* 1. Backdrop/Overlay: Fades in and closes the drawer when clicked */}
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* 2. Drawer Content: Slides in from the right */}
      <div className={`settings-drawer ${isOpen ? 'open' : ''} dark-theme`}>
        
        <div className="drawer-header">
          <h3>Settings</h3>
          {/* Close button (using simple text for 'no icons' requirement) */}
          <button 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Close Settings"
          >
            Close
          </button>
        </div>

        <div className="drawer-body">
          <p>User preferences and options go here.</p>
          
          {/* Example setting item */}
          <div className="setting-item">
             <span>Dark Mode</span>
             <input type="checkbox" defaultChecked />
          </div>
          
        </div>

        <div className="drawer-footer">
          <button 
            className="logout-button" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}