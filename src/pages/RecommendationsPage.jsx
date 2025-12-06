import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchNextFilms, fetchRecommendations, fetchPopular } from "../api/filmService";

// Component Imports
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import NavigationDrawer from "../Components/NavigationDrawer";

import "./RecommendationsPage.css";

// --- Sub-component: Home View (Swipe Stack) ---
function HomeRecommendationsView({ film, token, handleInteraction, loadNextBatch, setDetailFilm }) {
  const bannerUrl = film?.bannerPath
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : film?.backdropPath
    ? `https://image.tmdb.org/t/p/original/${film.backdropPath}`
    : film?.posterPath
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : "";

  return (
    <div className="recommendations-page font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" />
      
      <div className="film-scroll-area">
        <FilmCard film={film} onOpenDetail={() => setDetailFilm(film)} />
        <div className="bottom-scroll-spacer" />
      </div>
      
      <div className="poster-fade" /> 
      
      <ActionButtons
        films={[film]}
        setFilms={handleInteraction}
        token={token}
        loadNextBatch={loadNextBatch}
      />
    </div>
  );
}

// --- Main Page Component ---
export default function RecommendationsPage() {
  // 1. Auth & Navigation Hooks
  const { token, setToken, userName, setUserName } = useAuth();
  const navigate = useNavigate();

  // 2. UI State
  const [activeView, setActiveView] = useState('home'); // 'home' | 'forYou'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 3. Data State
  const [films, setFilms] = useState([]); // Home (Swipe) Stack
  const [popularFilms, setPopularFilms] = useState([]); 
  const [recommendedFilms, setRecommendedFilms] = useState([]); // Carousel Data

  // 4. Modal State
  const [detailFilm, setDetailFilm] = useState(null);
  const [modalSource, setModalSource] = useState(null); // 'home' | 'carousel'

  // 5. Logic State
  const [carouselActionCount, setCarouselActionCount] = useState(0); 

  // --- FETCHERS ---
  const loadNextBatch = useCallback(async () => {
    setError("");
    try {
      const nextFilms = await fetchNextFilms(token);
      const safe = Array.isArray(nextFilms) ? nextFilms.slice(0, 3) : [];
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

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    // 1. Clear Context
    setToken(null);
    if (setUserName) setUserName(null);
    
    // 2. Clear Local Storage
    localStorage.removeItem("token");
    
    // 3. Redirect
    navigate("/login");
  };

  // --- EFFECTS ---

  // Initial Load
  useEffect(() => {
    if (!token) {
      setError("Please log in.");
      setLoading(false);
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
  }, [token, loadNextBatch, loadForYouData]);

  // Carousel Refresh Watcher (The "Mod 3" Rule)
  useEffect(() => {
    if (carouselActionCount > 0 && carouselActionCount % 3 === 0) {
      console.log(`Hit ${carouselActionCount} interactions. Refreshing Carousel...`);
      setLoading(true);
      
      loadForYouData().then(() => {
        setCarouselActionCount(0); // Reset after fetch
        setTimeout(() => setLoading(false), 800);
      });
    }
  }, [carouselActionCount, loadForYouData]);

  // --- INTERACTION HANDLERS ---

  // 1. Home / Swipe View Handler
  const handleHomeInteraction = (filmIdOrUpdateFn) => {
    setFilms((prev) => {
      let updated;
      if (typeof filmIdOrUpdateFn === "function") {
        updated = filmIdOrUpdateFn(prev);
      } else {
        updated = prev.filter((f) => f.id !== filmIdOrUpdateFn);
      }
      
      if (updated.length === 0) {
        loadNextBatch();
      }
      return updated;
    });
  };

  // 2. Carousel / Modal Handler
  const handleCarouselListUpdate = (idOrUpdateFn) => {
    // Close Modal Immediately
    setDetailFilm(null);

    // Increment Counter
    setCarouselActionCount(prev => prev + 1);

    // Update Visual List Immediately
    setRecommendedFilms((prevList) => {
      if (typeof idOrUpdateFn === 'function') {
        return idOrUpdateFn(prevList);
      } else {
        return prevList.filter(f => f.id !== idOrUpdateFn);
      }
    });
  };

  // --- MODAL OPENERS ---
  const openDetailFromHome = (film) => {
    setDetailFilm(film);
    setModalSource('home');
  };

  const openDetailFromCarousel = (film) => {
    setDetailFilm(film);
    setModalSource('carousel');
  };

  // --- MANUAL REFRESH ---
  const handleRefresh = async () => {
    setLoading(true);
    await loadForYouData();
    setCarouselActionCount(0);
    setTimeout(() => setLoading(false), 800);
  };

  const currentFilm = useMemo(() => films[0], [films]);

  // --- RENDER ---
  if (!token) return <div className="empty-state font-kino">Please log in.</div>;
  
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

    if (!currentFilm) {
      return <div className="empty-state font-kino">{error || "No more films!"}</div>;
    }

    return (
      <HomeRecommendationsView 
        film={currentFilm} 
        token={token} 
        loadNextBatch={loadNextBatch} 
        handleInteraction={handleHomeInteraction} 
        setDetailFilm={openDetailFromHome} 
      />
    );
  };

  return (
    <>
      {/* Top Navigation with Menu Trigger */}
      <TopNav 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onMenuClick={() => setIsDrawerOpen(true)}
      />
      
      {/* Side Drawer */}
      <NavigationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      {renderContent()}

      {/* Detail Modal */}
      {detailFilm && (
        <FilmDetailModal
          film={detailFilm}
          onClose={() => setDetailFilm(null)}
          token={token}
          // Dynamic Props based on Source
          films={modalSource === 'home' ? films : recommendedFilms}
          setFilms={modalSource === 'home' ? handleHomeInteraction : handleCarouselListUpdate}
          loadNextBatch={modalSource === 'home' ? loadNextBatch : null} 
        />
      )}
    </>
  );
}