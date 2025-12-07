/* RecommendationsPage.jsx */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchNextFilms, fetchRecommendations, fetchPopular, sendInteraction } from "../api/filmService";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import SettingsDrawer from "../Components/SettingsDrawer.jsx";

import "./RecommendationsPage.css";

// --- Sub-component: Home View ---
function HomeRecommendationsView({ films, token, handleInteraction, loadNextBatch, setDetailFilm }) {
  const currentFilm = films[0];
  const nextFilm = films[1];

  // Motion Value (Managed in Parent for linked animations)
  const x = useMotionValue(0);
  const isSwiping = useRef(false);

  // --- 1. Slicker Animations ---
  // Rotate: Less rotation for a more professional feel
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  
  // Opacity: Stay opaque (1) longer (until 150px) to prevent "peeking"
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  // Back Card Animation: Grows slightly as you swipe the front card away
  const backCardScale = useTransform(x, [-200, 0, 200], [1, 0.96, 1]);
  const backCardOpacity = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);

  // --- 2. State Reset Fix ---
  // When the film changes, INSTANTLY reset X to 0 to prevent the "stuck" glitch
  useEffect(() => {
    x.set(0);
    isSwiping.current = false;
  }, [currentFilm, x]);

  // Background Banner Logic
  const activeFilm = currentFilm || nextFilm;
  const bannerUrl = activeFilm?.bannerPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.bannerPath}`
    : activeFilm?.backdropPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.backdropPath}`
    : activeFilm?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${activeFilm.posterPath}`
    : "";

  const getPosterUrl = (film) => film?.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  const onDragEnd = (event, info) => {
    const threshold = 100;
    const swipeDistance = info.offset.x;
    
    // Check if swipe is strong enough
    if (Math.abs(swipeDistance) > threshold && !isSwiping.current) {
      isSwiping.current = true;
      const direction = swipeDistance > 0 ? "right" : "left";
      const type = direction === "right" ? "like" : "dislike";
      
      // 1. Optimistic UI Removal
      handleInteraction(currentFilm.id);

      // 2. API Call
      sendInteraction(token, currentFilm.id, type).catch(err => 
        console.error("Interaction failed", err)
      );
    }
  };

  return (
    <div className="recommendations-page font-kino" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />
      
      {/* --- 3. Layout Fix: flex: 1 ensures this fills all space between Nav and Buttons --- */}
      <div className="film-scroll-area" style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* BACK CARD (Next Film) */}
        {nextFilm && (
          <motion.div 
            style={{ 
              position: 'absolute',
              width: '100%', 
              height: '100%',
              zIndex: 5,
              scale: backCardScale,     // Animated
              opacity: backCardOpacity, // Animated
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
             <div className="film-card">
                <div className="poster-container">
                   {getPosterUrl(nextFilm) ? (
                      <img src={getPosterUrl(nextFilm)} alt="" className="film-card-poster" />
                   ) : <div className="film-card-poster bg-gray-800" />}
                </div>
                {/* Hide text on back card to reduce visual noise */}
                <div style={{ opacity: 0 }}>
                   <h1 className="film-title">Placeholder</h1>
                </div>
             </div>
          </motion.div>
        )}

        {/* FRONT CARD (Current Film) */}
        <AnimatePresence>
          {currentFilm ? (
            <motion.div
              key={currentFilm.id}
              style={{ 
                position: 'absolute',
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
              dragElastic={0.6} // Tighter elastic for slicker feel
              onDragEnd={onDragEnd}
              whileTap={{ cursor: 'grabbing', scale: 0.98 }}
              
              // Slick Entrance: Just appear (since back card was already there)
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              
              // Slick Exit: Fly out fast
              exit={{ 
                x: x.get() < 0 ? -600 : 600, 
                opacity: 0, 
                transition: { duration: 0.2, ease: "easeIn" } 
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
      </div>
      
      <div className="poster-fade" /> 
      
      {/* Buttons anchored at bottom via flex layout */}
      <div style={{ flexShrink: 0, zIndex: 20 }}>
        <ActionButtons
          films={films}
          setFilms={handleInteraction}
          token={token}
          loadNextBatch={loadNextBatch}
        />
      </div>
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
      setFilms((prev) => {
        if (prev.length === 0) return safe;
        const newItems = safe.filter(n => !prev.some(p => p.id === n.id));
        return [...prev, ...newItems];
      });
    } catch (err) {
      console.error("Failed to fetch films", err);
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
  const handleHomeInteraction = (filmIdOrUpdateFn) => {
    setFilms((prev) => {
      let updated;
      if (typeof filmIdOrUpdateFn === "function") {
        updated = filmIdOrUpdateFn(prev);
      } else {
        updated = prev.filter((f) => f.id !== filmIdOrUpdateFn);
      }
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