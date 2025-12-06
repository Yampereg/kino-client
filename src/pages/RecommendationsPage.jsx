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

  const [films, setFilms] = useState([]); // Home/Swipe films
  const [popularFilms, setPopularFilms] = useState([]);
  const [recommendedFilms, setRecommendedFilms] = useState([]); // Carousel films
  
  const [detailFilm, setDetailFilm] = useState(null);
  const [modalSource, setModalSource] = useState(null); // 'home' or 'carousel'
  const [carouselActionCount, setCarouselActionCount] = useState(0); // Track carousel interactions

  // 1. Fetchers
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

  // 2. Initial Load
  useEffect(() => {
    if (!token) {
      setError("Please log in to get recommendations.");
      setLoading(false);
      return;
    }
    const loadInitialData = async () => {
      try {
        await loadNextBatch();
        await loadForYouData();
      } catch (err) {
        setError("Could not load initial data.");
      } finally {
        setTimeout(() => setLoading(false), 1200);
      }
    };
    loadInitialData();
  }, [token, loadNextBatch, loadForYouData]);

  // 3. Home/Swipe Interaction Logic
  const handleHomeInteraction = (filmIdOrUpdateFn) => {
    // Check if it's a direct ID (from ActionButtons click) or a state update function (from Modal)
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

  // 4. Carousel Interaction Logic (The "Magic" Wrapper)
  // This acts as a "setFilms" replacement for the Modal when opened from the Carousel
  const handleCarouselListUpdate = async (updateFn) => {
    setRecommendedFilms((prevList) => {
      const updatedList = updateFn(prevList);
      
      // If the list got smaller, an item was removed (Like/Dislike)
      if (updatedList.length < prevList.length) {
        const newCount = carouselActionCount + 1;
        setCarouselActionCount(newCount);
        console.log(`Carousel Interaction: ${newCount}/3`);

        // Close modal immediately
        setDetailFilm(null);

        // Check if we need to refresh (After 3 interactions)
        if (newCount >= 3) {
          console.log("Refetching Carousel...");
          setLoading(true);
          loadForYouData().then(() => {
            setCarouselActionCount(0);
            setTimeout(() => setLoading(false), 500);
          });
        }
      }
      return updatedList;
    });
  };

  // 5. Handlers for Opening Modal
  const openDetailFromHome = (film) => {
    setDetailFilm(film);
    setModalSource('home');
  };

  const openDetailFromCarousel = (film) => {
    setDetailFilm(film);
    setModalSource('carousel');
  };

  // 6. Refresh Handler for Pull-to-refresh
  const handleRefresh = async () => {
    setLoading(true);
    await loadForYouData();
    setCarouselActionCount(0); // Reset count on manual refresh
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

  // 7. Render Logic
  const renderContent = () => {
    if (activeView === 'forYou') {
      return (
        <ForYouPage 
          popularFilms={popularFilms} 
          recommendedFilms={recommendedFilms}
          onRefresh={handleRefresh}
          onFilmClick={openDetailFromCarousel} // Pass handler
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
        handleInteraction={handleHomeInteraction} // Use Home logic
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
          // DYNAMIC PROPS BASED ON SOURCE
          films={modalSource === 'home' ? films : recommendedFilms}
          setFilms={modalSource === 'home' ? handleHomeInteraction : handleCarouselListUpdate}
          loadNextBatch={modalSource === 'home' ? loadNextBatch : () => {}} // No auto-load next batch for carousel
        />
      )}
    </>
  );
}