/* src/pages/RecommendationsPage.jsx */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  fetchNextFilms, 
  fetchPopular, 
  fetchRecommendations, 
  sendInteraction,
  fetchLikedFilms,
  fetchDislikedFilms
} from "../api/filmService";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import SettingsDrawer from "../Components/SettingsDrawer.jsx";
import LikedDislikedModal from "../Components/LikedDislikedModal.jsx";

import "./RecommendationsPage.css";

// --- REUSABLE COMPONENT: Full Screen Loader ---
const FullScreenLoader = () => (
  <div className="loading-screen font-kino">
    <div className="loader-content">
      <div className="loader-ring"></div>
      <div className="loader-logo">KINO</div>
    </div>
  </div>
);

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
    : `https://image.tmdb.org/t/p/w780/${film.bannerPath}`;

  return (
    <motion.div
      className="swipeable-poster-wrapper"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      onTap={() => {
        if (!hasSwiped.current) onOpenDetail();
      }}
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
      <div className="film-card-poster-container">
        <div className="poster-inner">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={film.title}
              className="film-card-poster"
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
function HomeRecommendationsView({ films, token, handleInteraction, loadNextBatch, setDetailFilm, isFetchingNext }) {
  const currentFilm = films[0];
  const nextFilm = films[1];

  const onCardSwipe = async (direction) => {
    if (!currentFilm) return;
    const filmId = currentFilm.id;
    const type = direction === "right" ? "like" : "dislike";
    
    // 1. Optimistic Update
    handleInteraction(filmId);
    
    // 2. Async Server Sync
    try {
      await sendInteraction(token, filmId, type);
    } catch (err) {
      console.error("Swipe API failed", err);
    }
  };

  const activeFilm = currentFilm || nextFilm;
  
  const bannerUrl = activeFilm?.bannerPath
    ? `https://image.tmdb.org/t/p/w1280/${activeFilm.bannerPath}`
    : activeFilm?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${activeFilm.posterPath}`
    : "";

  const getPosterUrl = (film) => film?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  return (
    <div className="recommendations-container font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />

      {/* --- GRID ROW 1: POSTER AREA --- */}
      <div className="rec-poster-area">
        {/* Next Film */}
        {nextFilm && (
          <motion.div
            key={nextFilm.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="next-film-layer"
          >
             <div className="film-card-poster-container">
                <div className="poster-inner">
                   {getPosterUrl(nextFilm) && (
                      <img src={getPosterUrl(nextFilm)} alt="" className="film-card-poster" />
                   )}
                </div>
             </div>
          </motion.div>
        )}

        {/* Current Film */}
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
               {isFetchingNext ? (
                 <FullScreenLoader />
               ) : (
                 <>
                   <h2>No more films!</h2>
                   <p>Check back later.</p>
                 </>
               )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- GRID ROW 2: SCROLLABLE INFO AREA --- */}
      <div className="rec-info-area">
        {currentFilm && (
          <motion.div
            key={currentFilm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="info-content-wrapper"
          >
            <h1 className="film-title">
              {currentFilm.title}
            </h1>

            <div className="film-genres">
              {(currentFilm.genres || []).slice(0, 3).map((g) => (
                <span key={g.id || g.name} className="genre-tag">
                  {g.name}
                </span>
              ))}
            </div>

            {currentFilm.overview && (
               <p className="film-overview">
                 {currentFilm.overview}
               </p>
            )}

            <div style={{ height: '20px' }} />
          </motion.div>
        )}
      </div>

      {/* --- GRID ROW 3: ACTION BUTTONS --- */}
      <div className="rec-actions-area">
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
  
  // State for Liked/Disliked Modal
  const [likedModal, setLikedModal] = useState({ open: false, type: 'liked' });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [films, setFilms] = useState([]);
  const [popularFilms, setPopularFilms] = useState([]);
  const [recommendedFilms, setRecommendedFilms] = useState([]);
  const [likedFilms, setLikedFilms] = useState([]);
  const [dislikedFilms, setDislikedFilms] = useState([]);
  
  const [isForYouRefreshing, setIsForYouRefreshing] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  const [detailFilm, setDetailFilm] = useState(null);
  const [modalSource, setModalSource] = useState(null);
  const [carouselActionCount, setCarouselActionCount] = useState(0);

  const seenFilmIds = useRef(new Set());

  // 1. Fetch & Process '/next' Films
  const loadNextBatch = useCallback(async () => {
    setIsFetchingNext(true);
    setError("");
    let newItems = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 3; 

    while (newItems.length === 0 && attempts < MAX_ATTEMPTS) {
        try {
            const nextFilms = await fetchNextFilms(token);
            const safe = Array.isArray(nextFilms) ? nextFilms : [];
            
            if (safe.length === 0) break; 

            newItems = safe.filter(f => !seenFilmIds.current.has(f.id));
            
            if (newItems.length > 0) break; 

            console.log("Duplicate batch detected, retrying fetch...");
            attempts++;
        } catch (err) {
            console.error("Failed to fetch films", err);
            break;
        }
    }

    if (newItems.length > 0) {
        setFilms((prev) => {
            const unique = newItems.filter(n => !prev.some(p => p.id === n.id));
            return [...prev, ...unique];
        });
    }
    setIsFetchingNext(false);
  }, [token]);

  // 2. Fetch ALL Data (For You + Liked + Disliked)
  const loadForYouData = useCallback(async () => {
    console.log('loadForYouData CALLED - DO NOT SET LOADING HERE');
    console.trace('WHO CALLED loadForYouData?'); // SHOW STACK TRACE
    try {
      const [popular, recommendations, liked, disliked] = await Promise.all([
         fetchPopular(),
         fetchRecommendations(),
         fetchLikedFilms(),
         fetchDislikedFilms()
      ]);
      setPopularFilms(popular || []);
      setRecommendedFilms(recommendations || []);
      setLikedFilms(liked || []);
      setDislikedFilms(disliked || []);
      console.log('loadForYouData COMPLETE - Liked:', liked?.length, 'Disliked:', disliked?.length);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  // DEBUG: Log when loading changes
  useEffect(() => {
    console.log('LOADING STATE CHANGED:', loading);
  }, [loading]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const startAppSequence = async () => {
      try {
        console.log('START: Initial app load');
        setLoading(true);
        await Promise.all([
            loadNextBatch(), 
            loadForYouData()
        ]);
        console.log('DONE: Initial app load');
      } catch (err) {
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    startAppSequence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ONLY RUN ONCE ON MOUNT

  // FIXED: Removed setLoading(true) to prevent blocking modal
  useEffect(() => {
    if (carouselActionCount > 0 && carouselActionCount % 3 === 0) {
      // Silently refresh "For You" data without blocking UI
      loadForYouData().then(() => {
        setCarouselActionCount(0);
      });
    }
  }, [carouselActionCount, loadForYouData]);

  const handleHomeInteraction = (filmIdOrUpdateFn) => {
    setFilms((prev) => {
      let updated;
      let removedId = null;

      if (typeof filmIdOrUpdateFn === "function") {
        updated = filmIdOrUpdateFn(prev);
      } else {
        removedId = filmIdOrUpdateFn;
        updated = prev.filter((f) => f.id !== removedId);
      }

      if (removedId) {
          seenFilmIds.current.add(removedId);
      }

      if (updated.length < 5) {
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

  const handleDetailOpen = (film, source) => {
    setDetailFilm(film);
    setModalSource(source);
  };

  const handleRefresh = async () => {
    if (isForYouRefreshing) return;
    console.log('handleRefresh CALLED - setting isForYouRefreshing, NOT loading');
    setIsForYouRefreshing(true);
    try {
      await loadForYouData();
    } catch (err) {
      console.error("Failed to refresh For You data", err);
    }
    setCarouselActionCount(0);
    setIsForYouRefreshing(false);
  };

  if (!token) return null;

  const renderContent = () => {
    if (activeView === 'forYou') {
      return (
        <ForYouPage
          popularFilms={popularFilms}
          recommendedFilms={recommendedFilms}
          onRefresh={handleRefresh}
          onFilmClick={handleDetailOpen}
          isRefreshing={isForYouRefreshing}
        />
      );
    }

    return (
      <HomeRecommendationsView
        films={films}
        token={token}
        loadNextBatch={loadNextBatch}
        handleInteraction={handleHomeInteraction}
        setDetailFilm={(f) => handleDetailOpen(f, 'home')}
        isFetchingNext={isFetchingNext}
      />
    );
  };

  // Show loading screen ONLY during initial data fetch
  if (loading) {
    return <FullScreenLoader />;
  }

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
        onShowLiked={(type) => {
          console.log('CLICKED LIKED/DISLIKED:', type);
          console.log('Current loading state:', loading);
          console.log('Liked films count:', likedFilms.length);
          console.log('Disliked films count:', dislikedFilms.length);
          setLikedModal({ open: true, type });
        }}
      />

      {renderContent()}

      {detailFilm && (
        <FilmDetailModal
          film={detailFilm}
          onClose={() => setDetailFilm(null)}
          token={token}
          films={modalSource === 'home' ? films : (modalSource === 'carousel' ? recommendedFilms : [])}
          setFilms={modalSource === 'home' ? handleHomeInteraction : handleCarouselListUpdate}
          loadNextBatch={modalSource === 'home' ? loadNextBatch : null}
          showActions={modalSource !== 'popular'}
        />
      )}

      {/* Liked / Disliked Modal - Renders ABOVE everything */}
      {likedModal.open && (
        <LikedDislikedModal 
          type={likedModal.type}
          films={likedModal.type === 'liked' ? likedFilms : dislikedFilms}
          onClose={() => setLikedModal({ open: false, type: likedModal.type })} 
        />
      )}
    </>
  );
}