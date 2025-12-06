import React, { useState, useEffect, useMemo, useCallback } from "react";
import { fetchNextFilms, fetchRecommendations, fetchPopular } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import "./RecommendationsPage.css";

// --- Sub-component for Home View ---
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
  const token = localStorage.getItem("token");
  const [activeView, setActiveView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [films, setFilms] = useState([]); 
  const [popularFilms, setPopularFilms] = useState([]); 
  const [recommendedFilms, setRecommendedFilms] = useState([]); 
  
  const [detailFilm, setDetailFilm] = useState(null);
  const [modalSource, setModalSource] = useState(null); 
  const [carouselActionCount, setCarouselActionCount] = useState(0); 

  // --- 1. Fetchers ---
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

  // --- 2. Initial Load ---
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

  // --- 3. Interaction Handlers ---

  // Handle interactions from the Home Swipe View
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

  // Handle interactions from the Carousel (via Modal)
  const handleCarouselListUpdate = (idOrUpdateFn) => {
    // 1. Close the modal immediately
    setDetailFilm(null);

    // 2. Update the list visually
    setRecommendedFilms((prevList) => {
      let updatedList;
      
      // Handle both functional updates and direct ID filtering
      if (typeof idOrUpdateFn === 'function') {
        updatedList = idOrUpdateFn(prevList);
      } else {
        updatedList = prevList.filter(f => f.id !== idOrUpdateFn);
      }

      // 3. Logic: If an item was actually removed
      if (updatedList.length < prevList.length) {
        const newCount = carouselActionCount + 1;
        console.log(`Carousel Interaction: ${newCount}/3`);
        
        // Update count state
        setCarouselActionCount(newCount);

        // 4. Check if we reached the threshold to refresh
        if (newCount >= 3) {
          console.log("Threshold reached. Refreshing carousel...");
          setLoading(true);
          
          // Fetch new data
          loadForYouData().then(() => {
            setCarouselActionCount(0); // Reset count
            setTimeout(() => setLoading(false), 600);
          });
          
          // Return empty temporarily while loading (optional, or keep old list until load finishes)
          return updatedList; 
        }
      }
      
      return updatedList;
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

  const currentFilm = useMemo(() => films[0], [films]);

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

    if (!currentFilm) return <div className="empty-state font-kino">{error || "No more films!"}</div>;

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
      <TopNav activeView={activeView} onViewChange={setActiveView} />
      {renderContent()}

      {detailFilm && (
        <FilmDetailModal
          film={detailFilm}
          onClose={() => setDetailFilm(null)}
          token={token}
          // Pass the specific handler based on where the modal was opened from
          films={modalSource === 'home' ? films : recommendedFilms}
          setFilms={modalSource === 'home' ? handleHomeInteraction : handleCarouselListUpdate}
          
          // If in carousel, we don't need to loadNextBatch on interaction, we just close
          loadNextBatch={modalSource === 'home' ? loadNextBatch : null} 
        />
      )}
    </>
  );
}