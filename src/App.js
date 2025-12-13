import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './Components/PrivateRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Main from './pages/Main';
import RecommendationsPage from './pages/RecommendationsPage';
import ForYouPage from './pages/ForYouPage';
import LikedDislikedPage from './pages/LikedDislikedPage';
import './App.css';

function App() {
  return (
    // 1. Router must be the top-level wrapper so AuthProvider can use navigation hooks
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Main />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/foryou" element={<ForYouPage />} />
              
              {/* New Routes */}
              <Route path="/liked" element={<LikedDislikedPage type="liked" />} />
              <Route path="/disliked" element={<LikedDislikedPage type="disliked" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;