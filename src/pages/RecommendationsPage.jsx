/* RecommendationsPage.jsx */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchNextFilms, fetchRecommendations, fetchPopular, sendInteraction } from "../api/filmService";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import SettingsDrawer from "../Components/SettingsDrawer.jsx";

import "./RecommendationsPage.css";

// --- ISOLATED COMPONENT: Swipeable Poster ---
const SwipeablePoster = ({ film, onSwipe, onOpenDetail }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); 
  const opacity = useTransform(x, [-200, -120, 0, 120, 200], [0, 1, 1, 1, 0]);

  const hasSwiped = useRef(false);

  const onDragEnd = (event, info) => {
    const threshold = 80;
    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > threshold && !hasSwiped.current) {
      hasSwiped.current = true;
      const direction = swipeDistance > 0 ? "right" : "left";
      onSwipe(direction);
    }
  };

  const posterUrl = film.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : `https://image.tmdb.org/t/p/original/${film.bannerPath}`;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0, left: 0, 
        width: '100%', height: '100%',
        zIndex: 10,
        x, rotate, opacity,
        cursor: 'grab',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: x.get() < 0 ? -500 : 500,
        opacity: 0,
        rotate: x.get() < 0 ? -30 : 30,
        transition: { duration: 0.2 }
      }}
    >
      <div className="film-card" style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
        <div className="poster-container" style={{ marginBottom: 0 }}>
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt={film.title} 
              className="film-card-poster" 
              onClick={onOpenDetail}
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            />
          ) : (
            <div className="film-card-poster bg-gray-800" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Sub-component: Home View ---
function HomeRecommendationsView({ films, token, handleInteraction, loadNextBatch, setDetailFilm }) {
  const currentFilm = films[0];
  const nextFilm = films[1];

  const onCardSwipe = async (direction) => {
    if (!currentFilm) return;
    const filmId = currentFilm.id;
    const type = direction === "right" ? "like" : "dislike";
    handleInteraction(filmId);
    try {
      await sendInteraction(token, filmId, type);
    } catch (err) {
      console.error("Swipe API failed", err);
    }
  };

  const activeFilm = currentFilm || nextFilm;
  const bannerUrl = activeFilm?.bannerPath
    ? `https://image.tmdb.org/t/p/original/${activeFilm.bannerPath}`
    : activeFilm?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${activeFilm.posterPath}`
    : "";

  const getPosterUrl = (film) => film?.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  return (
    <div className="recommendations-page font-kino" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />
      
      {/* 1. POSTER AREA (Fixed 55% height) */}
      <div style={{ flex: '0 0 55%', position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Next Film (Back Card) */}
        {nextFilm && (
          <motion.div 
            key={nextFilm.id} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ 
              position: 'absolute',
              width: '100%', height: '100%',
              zIndex: 5,
              transform: 'scale(0.95)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
             <div className="film-card" style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
                <div className="poster-container" style={{ marginBottom: 0 }}>
                   {getPosterUrl(nextFilm) && (
                      <img src={getPosterUrl(nextFilm)} alt="" className="film-card-poster" />
                   )}
                </div>
             </div>
          </motion.div>
        )}

        {/* Current Film (Front Poster) */}
        <AnimatePresence mode="popLayout">
          {currentFilm ? (
            <SwipeablePoster 
              key={currentFilm.id} 
              film={currentFilm}
              onSwipe={onCardSwipe}
              onOpenDetail={() => setDetailFilm(currentFilm)}
            />
          ) : (
            <div className="empty-state font-kino">
               <h2>No more films!</h2>
               <p>Check back later.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. SCROLLABLE TEXT AREA (Fills remaining space) */}
      <div 
        className="info-scroll-container"
        style={{ 
          flex: '1 1 auto',        // Grow and shrink to fill space
          minHeight: 0,            // CRITICAL: prevents overflow from pushing parent
          overflowY: 'auto',       // Enables scroll
          padding: '0 24px', 
          zIndex: 15, 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          // Optional: Fade effect at bottom
          maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
      }}>
        {currentFilm && (
          <motion.div 
            key={currentFilm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="film-title" style={{ fontSize: '1.8rem', marginBottom: '8px', marginTop: '10px' }}>
              {currentFilm.title}
            </h1>
            <div className="film-genres" style={{ justifyContent: 'center', marginBottom: '12px' }}>
              {(currentFilm.genres || []).slice(0, 3).map((g) => (
                <span key={g.id || g.name} className="genre-tag">
                  {g.name}
                </span>
              ))}
            </div>
            {currentFilm.overview && (
               <p className="film-overview" style={{ 
                 fontSize: '0.9rem', 
                 opacity: 0.8, 
                 paddingBottom: '20px' 
               }}>
                 {currentFilm.overview}
               </p>
            )}
          </motion.div>
        )}
      </div>
      
      {/* 3. ACTION BUTTONS (Fixed at Bottom) */}
      <div style={{ flex: '0 0 auto', zIndex: 20, paddingBottom: '30px', background: 'transparent' }}>
        <ActionButtons
          films={films}
          setFilms={handleInteraction}
          token={token}
          loadNextBatch={loadNextBatch}
        />
      </div>

      {/* Custom Scrollbar Styles injected directly */}
      <style>{`
        .info-scroll-container::-webkit-scrollbar {
          width: 4px; /* Thin scrollbar */
        }
        .info-scroll-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05); 
        }
        .info-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3); 
          border-radius: 4px;
        }
        .info-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5); 
        }
      `}</style>
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