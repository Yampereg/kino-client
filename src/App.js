import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Main from "./pages/Main";
import RecommendationsPage from "./pages/RecommendationsPage";
import ForYouPage from "./pages/ForYouPage";
import LikedDislikedPage from "./pages/LikedDislikedPage"; // Import the new page
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
          
          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Main />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/foryou" element={<ForYouPage />} />
            
            {/* New Routes for Liked/Disliked */}
            <Route path="/liked" element={<LikedDislikedPage type="liked" />} />
            <Route path="/disliked" element={<LikedDislikedPage type="disliked" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;