import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // 1. Initialize State from Local Storage
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem("kino_username");
    return savedName ? { name: savedName } : null;
  });

  // 2. Sync Token changes to Local Storage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // 3. Sync User changes to Local Storage
  useEffect(() => {
    if (user && user.name) {
      localStorage.setItem("kino_username", user.name);
    } else {
      localStorage.removeItem("kino_username");
    }
  }, [user]);

  // 4. Action Functions
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
    loginUser, // <--- This MUST be here for Login.jsx to work
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}