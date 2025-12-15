/* src/App.js */
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import RecommendationsPage from "./pages/RecommendationsPage";
import LikedDislikedPage from "./pages/LikedDislikedPage"; // New import
import PrivateRoute from "./Components/PrivateRoute";

function App() {
  useEffect(() => {
    document.title = "Kino";
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route
          path="/recommendations"
          element={
            <PrivateRoute>
              <RecommendationsPage />
            </PrivateRoute>
          }
        />

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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;