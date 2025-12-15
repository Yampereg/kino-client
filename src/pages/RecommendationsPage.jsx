/* src/pages/RecommendationsPage.jsx - COMPLETE FIX */
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
import SettingsDrawer from "../Components/SettingsDrawer";
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

// --- PAGE HEADER COMPONENT (moved here to access state) ---
function PageHeader({ onRefresh, isRefreshing, onOpenDrawer }) {
  const { user } = useAuth();
  const username = user && user.name ? user.name : "User";

  const handleRefreshClick = () => {
    if (onRefresh && !isRefreshing) {
      onRefresh(); 
    }
  };

  return (
    <div className="page-header">
      <div className="greeting">
        <div className="greeting-group">
          <div className="greeting-icon">
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="header-text">
            <span className="user-name">Hi {username}</span>
            <span className="welcome-message">Welcome back to Kino</span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`refresh-button ${isRefreshing ? "spinning" : ""}`}
            onClick={handleRefreshClick}
            aria-label="Refresh Recommendations"
            disabled={isRefreshing}
          >
            <svg className="refresh-icon" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>

          <button
            className="refresh-button"
            onClick={onOpenDrawer}
            aria-label="Open Settings"
          >
            <svg className="refresh-icon" viewBox="0 0 24 24">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.97l-.38-2.65c-.04-.26-.25-.44-.5-.44h-4c-.25 0-.46.18-.5.44l-.38 2.65c-.63.24-1.17.58-1.69.97l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.06.73 1.69.97l.38 2.65c.04.26.25.44.5.44h4c.25 0 .46-.18.5-.44l.38-2.65c.63-.24 1.17-.58 1.69-.97l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- FOR YOU PAGE COMPONENT ---
function ForYouPage({ popularFilms, recommendedFilms, onRefresh, onFilmClick, isRefreshing, onOpenDrawer }) {
  return (
    <div className="for-you-page">
      <div className="content-scroll-area">
        <PageHeader onRefresh={onRefresh} isRefreshing={isRefreshing} onOpenDrawer={onOpenDrawer} />

        <section className="section">
          <h2 className="section-title">Top Picks For You</h2>
          
          <div className="film-carousel-wrapper">
            {recommendedFilms && recommendedFilms.length > 0 && (
              <div style={{ cursor: 'pointer' }}>
                {recommendedFilms.slice(0, 5).map((film) => (
                  <div key={film.id} onClick={() => onFilmClick(film, 'carousel')}>
                    {/* Simplified carousel item */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Popular Now</h2>
          <div className="film-list-container">
            {popularFilms && popularFilms.map((film, index) => (
              <div 
                key={film.id || index} 
                className="film-list-item"
                onClick={() => onFilmClick(film, 'popular')}
                style={{ cursor: "pointer" }}
              >
                <span className="list-number">{index + 1}</span>
                <div className="list-poster-wrapper">
                  {film.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200/${film.posterPath}`}
                      alt={film.title}
                      className="list-poster"
                    />
                  ) : (
                    <div className="missing-poster-list"></div>
                  )}
                </div>
                <div className="list-info">
                  <span className="list-title">{film.title}</span>
                  <div className="list-rating">
                    <span className="star-icon">★</span>
                    <span>{film.voteAverage ? film.voteAverage.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <div className="page-footer">KINO</div>
      </div>
    </div>
  );
}

// --- Sub-component: Home View ---
function HomeRecommendationsView({ films, token, handleInteraction, loadNextBatch, setDetailFilm, isFetchingNext }) {
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

      <div className="rec-poster-area">
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

      <div className="rec-info-area">
        {currentFilm && (
          <motion.div
            key={currentFilm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="info-content-wrapper"
          >
            <h1 className="film-title">{currentFilm.title}</h1>

            <div className="film-genres">
              {(currentFilm.genres || []).slice(0, 3).map((g) => (
                <span key={g.id || g.name} className="genre-tag">
                  {g.name}
                </span>
              ))}
            </div>

            {currentFilm.overview && (
               <p className="film-overview">{currentFilm.overview}</p>
            )}

            <div style={{ height: '20px' }} />
          </motion.div>
        )}
      </div>

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

  const seenFilmIds = useRef(new Set());

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

  const loadForYouData = useCallback(async () => {
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
      console.log('Liked Films loaded:', liked?.length);
    } catch (err) {
      console.error("Failed to fetch data", err);
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

    const startAppSequence = async () => {
      try {
        setLoading(true);
        await Promise.all([loadNextBatch(), loadForYouData()]);
      } catch (err) {
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    startAppSequence();
  }, [token, navigate, loadNextBatch, loadForYouData]);

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

  const handleDetailOpen = (film, source) => {
    setDetailFilm(film);
    setModalSource(source);
  };

  const handleRefresh = async () => {
    if (isForYouRefreshing) return;
    setIsForYouRefreshing(true);
    await loadForYouData();
    setIsForYouRefreshing(false);
  };

  const handleShowLiked = useCallback((type) => {
    console.log("Opening modal for:", type);
    setLikedModal({ open: true, type });
    setIsDrawerOpen(false);
  }, []);

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
          onOpenDrawer={() => setIsDrawerOpen(true)}
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
        onShowLiked={handleShowLiked}
      />

      {renderContent()}

      {detailFilm && (
        <FilmDetailModal
          film={detailFilm}
          onClose={() => setDetailFilm(null)}
          token={token}
          films={films}
          setFilms={handleHomeInteraction}
          loadNextBatch={loadNextBatch}
          showActions={modalSource === 'home'}
        />
      )}

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