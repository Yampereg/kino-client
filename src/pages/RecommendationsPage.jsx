/* RecommendationsPage.jsx */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchNextFilms, fetchRecommendations, fetchPopular } from "../api/filmService";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

// Component Imports
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import SettingsDrawer from "../Components/SettingsDrawer.jsx";

import "./RecommendationsPage.css";

// --- Sub-component: Home View (Swipe Stack) ---
function HomeRecommendationsView({ films, token, handleInteraction, loadNextBatch, setDetailFilm }) {
  const currentFilm = films[0];
  const nextFilm = films[1];

  // Motion values for the active card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); // Subtle rotation
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]); // Fade only on hard swipes

  // Ref to prevent double-swiping the same card
  const isSwiping = useRef(false);

  // Background Banner Logic
  const activeFilm = currentFilm || nextFilm;
  const bannerUrl = activeFilm?.bannerPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.bannerPath}`
    : activeFilm?.backdropPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.backdropPath}`
    : activeFilm?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${activeFilm.posterPath}`
    : "";

  const onDragEnd = (event, info) => {
    const threshold = 100;
    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > threshold && !isSwiping.current) {
      isSwiping.current = true; // Lock interaction
      
      // Determine Direction
      const direction = swipeDistance > 0 ? "right" : "left";
      
      // Trigger interaction (Like/Dislike)
      handleInteraction(currentFilm.id, direction);

      // Reset lock after a short delay to allow animation to clear
      setTimeout(() => {
        isSwiping.current = false;
      }, 500);
    }
  };

  // Helper to get poster URL for the "Next" card background
  const getPosterUrl = (film) => film?.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  return (
    <div className="recommendations-page font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />
      
      {/* Container for the Card Stack */}
      <div className="film-scroll-area" style={{ position: 'relative' }}>
        
        {/* 1. BACK CARD (Next Film) - Image Only */}
        {/* We HIDE the text components to prevent the "messy" look */}
        {nextFilm && (
          <div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: 'scale(0.95) translateY(10px)',
              zIndex: 0,
              opacity: 0.6, // Dimmed
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
             {/* Only show the poster container, visually mimicking FilmCard structure */}
             <div className="film-card" style={{ pointerEvents: 'none' }}>
                <div className="poster-container">
                   {getPosterUrl(nextFilm) ? (
                      <img src={getPosterUrl(nextFilm)} alt="" className="film-card-poster" />
                   ) : <div className="film-card-poster bg-gray-800" />}
                </div>
                {/* Hiding Title/Desc so it doesn't overlap weirdly */}
                <div style={{ opacity: 0 }}>
                   <h1 className="film-title">Placeholder</h1>
                </div>
             </div>
          </div>
        )}

        {/* 2. FRONT CARD (Current Film) - Full Interactive Card */}
        <AnimatePresence>
          {currentFilm ? (
            <motion.div
              key={currentFilm.id}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', 
                height: '100%',
                zIndex: 10,
                x, 
                rotate,
                opacity,
                cursor: 'grab'
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7} // Makes it feel "snappy"
              onDragEnd={onDragEnd}
              whileTap={{ cursor: 'grabbing' }}
              // Smooth exit animation
              exit={{ 
                x: x.get() < 0 ? -400 : 400, 
                opacity: 0, 
                rotate: x.get() < 0 ? -20 : 20, 
                transition: { duration: 0.2 } 
              }}
            >
              <FilmCard film={currentFilm} onOpenDetail={() => setDetailFilm(currentFilm)} />
            </motion.div>
          ) : (
            <div className="empty-state font-kino">
               <h2>No more films!</h2>
               <p>Check back later.</p>
            </div>
          )}
        </AnimatePresence>
        
        <div className="bottom-scroll-spacer" />
      </div>
      
      <div className="poster-fade" /> 
      
      {/* Buttons work on the CURRENT film */}
      <ActionButtons
        films={films}
        setFilms={handleInteraction}
        token={token}
        loadNextBatch={loadNextBatch}
      />
    </div>
  );
}

// --- Main Page Component ---
export default function RecommendationsPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('home'); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [films, setFilms] = useState([]); 
  const [popularFilms, setPopularFilms] = useState([]); 
  const [recommendedFilms, setRecommendedFilms] = useState([]); 

  const [detailFilm, setDetailFilm] = useState(null);
  const [modalSource, setModalSource] = useState(null); 
  const [carouselActionCount, setCarouselActionCount] = useState(0); 

  // --- Fetchers ---
  const loadNextBatch = useCallback(async () => {
    setError("");
    try {
      const nextFilms = await fetchNextFilms(token);
      const safe = Array.isArray(nextFilms) ? nextFilms : [];
      // If we are running low, append; if empty, replace
      setFilms((prev) => {
        if (prev.length === 0) return safe;
        // Simple deduplication based on ID
        const newItems = safe.filter(n => !prev.some(p => p.id === n.id));
        return [...prev, ...newItems];
      });
    } catch (err) {
      console.error("Failed to fetch films", err);
      // Don't show error immediately if we still have films to show
      setFilms(prev => prev.length > 0 ? prev : []); 
    }
  }, [token]);

  const loadForYouData = useCallback(async () => {
    try {
      const popular = await fetchPopular();
      setPopularFilms(popular || []);
      const recommendations = await fetchRecommendations();
      setRecommendedFilms(recommendations || []);
    } catch (err) {
      console.error("Failed to fetch For You data", err);
    }
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  // --- Initial Load ---
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const loadInitialData = async () => {
      try {
        await loadNextBatch();
        await loadForYouData();
      } catch (err) {
        setError("Could not load data.");
      } finally {
        setTimeout(() => setLoading(false), 1200);
      }
    };
    loadInitialData();
  }, [token, loadNextBatch, loadForYouData, navigate]);

  // --- Refresh Carousel ---
  useEffect(() => {
    if (carouselActionCount > 0 && carouselActionCount % 3 === 0) {
      setLoading(true);
      loadForYouData().then(() => {
        setCarouselActionCount(0); 
        setTimeout(() => setLoading(false), 800);
      });
    }
  }, [carouselActionCount, loadForYouData]);

  // --- Handlers ---
  
  // Updated Interaction Handler
  const handleHomeInteraction = (filmIdOrUpdateFn) => {
    setFilms((prev) => {
      let updated;
      
      // If passing a function (standard setState usage)
      if (typeof filmIdOrUpdateFn === "function") {
        updated = filmIdOrUpdateFn(prev);
      } else {
        // Standard ID removal (Swipe/Button click)
        // We strictly remove the item matching the ID to avoid index errors
        updated = prev.filter((f) => f.id !== filmIdOrUpdateFn);
      }

      // Fetch more when running low (buffer size 3)
      if (updated.length < 3) {
        loadNextBatch();
      }
      return updated;
    });
  };

  const handleCarouselListUpdate = (idOrUpdateFn) => {
    setDetailFilm(null);
    setCarouselActionCount(prev => prev + 1);
    setRecommendedFilms((prevList) => {
      if (typeof idOrUpdateFn === 'function') {
        return idOrUpdateFn(prevList);
      } else {
        return prevList.filter(f => f.id !== idOrUpdateFn);
      }
    });
  };

  const openDetailFromHome = (film) => {
    setDetailFilm(film);
    setModalSource('home');
  };

  const openDetailFromCarousel = (film) => {
    setDetailFilm(film);
    setModalSource('carousel');
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadForYouData();
    setCarouselActionCount(0);
    setTimeout(() => setLoading(false), 800);
  };

  // --- Render ---
  if (!token) return null; 
  
  if (loading && films.length === 0) {
    return (
      <div className="loading-screen font-kino">
        <div className="loader-content">
          <div className="loader-ring"></div>
          <div className="loader-logo">KINO</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeView === 'forYou') {
      return (
        <ForYouPage 
          popularFilms={popularFilms} 
          recommendedFilms={recommendedFilms}
          onRefresh={handleRefresh}
          onFilmClick={openDetailFromCarousel} 
        />
      );
    }

    return (
      <HomeRecommendationsView 
        films={films} 
        token={token} 
        loadNextBatch={loadNextBatch} 
        handleInteraction={handleHomeInteraction} 
        setDetailFilm={openDetailFromHome} 
      />
    );
  };

  return (
    <>
      <TopNav 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onMenuClick={() => setIsDrawerOpen(true)}
      />
      
      <SettingsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        userName={user?.name} 
        onLogout={handleLogout}
      />

      {renderContent()}

      {detailFilm && (
        <FilmDetailModal
          film={detailFilm}
          onClose={() => setDetailFilm(null)}
          token={token}
          films={modalSource === 'home' ? films : recommendedFilms}
          setFilms={modalSource === 'home' ? handleHomeInteraction : handleCarouselListUpdate}
          loadNextBatch={modalSource === 'home' ? loadNextBatch : null} 
        />
      )}
    </>
  );
}