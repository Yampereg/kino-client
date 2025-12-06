/* RecommendationsPage.jsx */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchNextFilms, fetchRecommendations, fetchPopular } from "../api/filmService";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"; // Import Framer Motion

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
  // We grab the top two films to create the "Stack" effect
  const currentFilm = films[0];
  const nextFilm = films[1];

  // Motion values for the active card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]); // Rotate slightly on drag
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]); // Fade out on extreme swipe

  // Background Banner Logic (Show current film's banner)
  const activeFilm = currentFilm || nextFilm;
  const bannerUrl = activeFilm?.bannerPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.bannerPath}`
    : activeFilm?.backdropPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.backdropPath}`
    : activeFilm?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${activeFilm.posterPath}`
    : "";

  const handleDragEnd = (event, info) => {
    const threshold = 100; // Pixel distance to trigger swipe
    if (info.offset.x > threshold) {
      // Swipe Right (Like)
      handleInteraction(currentFilm.id); 
    } else if (info.offset.x < -threshold) {
      // Swipe Left (Dislike)
      handleInteraction(currentFilm.id); 
    }
  };

  return (
    <div className="recommendations-page font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />
      
      {/* We change this area to a relative container to stack the cards.
         The 'next' card sits behind, and the 'current' card sits on top with drag handlers.
      */}
      <div className="film-scroll-area" style={{ position: 'relative', overflow: 'hidden' }}>
        
        {/* 1. Background Card (Next Film) - Peeking */}
        {nextFilm && (
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              transform: 'scale(0.95) translateY(10px)', // Slightly smaller and lower
              opacity: 0.7, 
              zIndex: 0,
              pointerEvents: 'none' // Prevent interaction with back card
            }}
          >
            <FilmCard film={nextFilm} />
          </div>
        )}

        {/* 2. Foreground Card (Current Film) - Swipeable */}
        <AnimatePresence>
          {currentFilm ? (
            <motion.div
              key={currentFilm.id || 'current'}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 1,
                x, 
                rotate,
                opacity,
                cursor: 'grab'
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }} // Snap back if not swiped far enough
              onDragEnd={handleDragEnd}
              whileTap={{ cursor: 'grabbing' }}
              // Exit animation when it is removed from the list
              exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.3 } }}
            >
              <FilmCard film={currentFilm} onOpenDetail={() => setDetailFilm(currentFilm)} />
            </motion.div>
          ) : (
             <div className="empty-state">No more films!</div>
          )}
        </AnimatePresence>
        
        <div className="bottom-scroll-spacer" />
      </div>
      
      <div className="poster-fade" /> 
      
      <ActionButtons
        films={films} // Pass full list so buttons know what to act on
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

  const loadNextBatch = useCallback(async () => {
    setError("");
    try {
      const nextFilms = await fetchNextFilms(token);
      // Fetch more than 1 so we can stack them
      const safe = Array.isArray(nextFilms) ? nextFilms : [];
      setFilms(safe);
    } catch (err) {
      console.error("Failed to fetch films", err);
      setError("Could not load films.");
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

  useEffect(() => {
    if (carouselActionCount > 0 && carouselActionCount % 3 === 0) {
      setLoading(true);
      loadForYouData().then(() => {
        setCarouselActionCount(0); 
        setTimeout(() => setLoading(false), 800);
      });
    }
  }, [carouselActionCount, loadForYouData]);

  // Updated to handle both ID removal and direct State function updates
  const handleHomeInteraction = (filmIdOrUpdateFn) => {
    setFilms((prev) => {
      let updated;
      if (typeof filmIdOrUpdateFn === "function") {
        updated = filmIdOrUpdateFn(prev);
      } else {
        // Standard behavior: Remove the ID (Swiped away)
        updated = prev.filter((f) => f.id !== filmIdOrUpdateFn);
      }
      
      // Pre-fetch next batch if running low (e.g., less than 2 cards left)
      if (updated.length < 2) {
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

  if (!token) return null; 
  
  if (loading) {
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

    // Pass the ENTIRE films array to the view now
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