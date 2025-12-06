/* src/context/AuthContext.js */
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Initialize state from memory only (No localStorage)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const loginUser = (newToken, newName) => {
    setToken(newToken);
    setUser({ name: newName });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loginUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}