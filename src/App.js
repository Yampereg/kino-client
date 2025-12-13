import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Main from "./pages/Main";
import RecommendationsPage from "./pages/RecommendationsPage";
import ForYouPage from "./pages/ForYouPage";
import LikedDislikedPage from "./pages/LikedDislikedPage"; 
import PrivateRoute from "./Components/PrivateRoute";
import "./App.css";

function App() {
  useEffect(() => {
    document.title = "Kino";
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* FIX: We must wrap each component in <PrivateRoute> explicitly 
             because your PrivateRoute component renders {children}, not <Outlet />.
          */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Main />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/recommendations" 
            element={
              <PrivateRoute>
                <RecommendationsPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/foryou" 
            element={
              <PrivateRoute>
                <ForYouPage />
              </PrivateRoute>
            } 
          />

          {/* New Routes */}
          <Route 
            path="/liked" 
            element={
              <PrivateRoute>
                <LikedDislikedPage type="liked" />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/disliked" 
            element={
              <PrivateRoute>
                <LikedDislikedPage type="disliked" />
              </PrivateRoute>
            } 
          />

          {/* Reverted to /login to match your original version */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;