/* RecommendationsPage.jsx */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchNextFilms, fetchRecommendations, fetchPopular } from "../api/filmService";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import SettingsDrawer from "../Components/SettingsDrawer.jsx";

import "./RecommendationsPage.css";

// --- Sub-component: Home View (Swipe Stack) ---
function HomeRecommendationsView({ films, handleInteraction, loadNextBatch, setDetailFilm }) {
  const currentFilm = films[0];
  const nextFilm = films[1];

  // Motion values for the active card
  const x = useMotionValue(0);
  
  // Front card transformations
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Back card transformations (Linked to Front Card's X)
  const bgScale = useTransform(x, [-200, 0, 200], [1, 0.92, 1]);
  const bgOpacity = useTransform(x, [-200, 0, 200], [1, 0.6, 1]);

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
    const threshold = 120;
    const swipeDistance = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(swipeDistance) > threshold || Math.abs(velocity) > 500) {
      if (!isSwiping.current) {
        isSwiping.current = true;
        
        const direction = swipeDistance > 0 ? "right" : "left";
        
        // Pass ID and direction to parent handler
        handleInteraction(currentFilm.id, direction);

        // Reset lock shortly after
        setTimeout(() => {
          isSwiping.current = false;
        }, 300);
      }
    }
  };

  const getPosterUrl = (film) => film?.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  return (
    <div className="recommendations-page font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />
      
      <div className="film-scroll-area" style={{ position: 'relative' }}>
        
        {/* 1. BACK CARD (Next Film) */}
        {nextFilm && (
          <motion.div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 5,
              scale: bgScale,
              opacity: bgOpacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transformOrigin: 'center bottom'
            }}
          >
             <div className="film-card" style={{ pointerEvents: 'none' }}>
                <div className="poster-container">
                   {getPosterUrl(nextFilm) ? (
                      <img src={getPosterUrl(nextFilm)} alt="" className="film-card-poster" />
                   ) : <div className="film-card-poster bg-gray-800" />}
                </div>
                <div style={{ opacity: 0 }}>
                   <h1 className="film-title">Placeholder</h1>
                </div>
             </div>
          </motion.div>
        )}

        {/* 2. FRONT CARD (Current Film) */}
        <AnimatePresence mode="popLayout">
          {currentFilm ? (
            <motion.div
              key={currentFilm.id}
              style={{ 
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 10,
                x, 
                rotate,
                opacity,
                cursor: 'grab'
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={onDragEnd}
              whileTap={{ cursor: 'grabbing' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                x: x.get() < 0 ? -500 : 500, 
                opacity: 0, 
                rotate: x.get() < 0 ? -45 : 45, 
                transition: { duration: 0.3, ease: "easeIn" } 
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
      
      <ActionButtons
        films={films}
        setFilms={handleInteraction}
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
  
  // Handles both Swipe (ID + Direction) and ActionButtons (State Updater Function)
  const handleHomeInteraction = (arg1, arg2) => {
    // 1. Handle API Calls for Swipes
    // If arg2 is present (direction), it's a swipe action from HomeRecommendationsView
    if (typeof arg1 !== 'function' && arg2) {
       const direction = arg2;
       const filmId = arg1;
       
       // TODO: Add actual API calls for liking/disliking here (e.g., using filmService)
       if (direction === 'right') {
          // call filmService.likeFilm(filmId, token);
       } else if (direction === 'left') {
          // call filmService.dislikeFilm(filmId, token);
       }
       console.log(`Swiped ${direction} on film ${filmId}`);
    }

    // 2. Handle State Updates
    setFilms((prev) => {
      let updated;
      
      // If passing a function (standard setState usage from ActionButtons)
      if (typeof arg1 === "function") {
        updated = arg1(prev);
      } else {
        // Standard ID removal (Swipe)
        updated = prev.filter((f) => f.id !== arg1);
      }

      // Fetch more when running low
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