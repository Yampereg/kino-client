import React, { useState, useEffect, useMemo, useCallback } from "react";
import { fetchNextFilms, fetchRecommendations } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import "./RecommendationsPage.css";

// --- Sub-Component: Home View (Swiping Logic) ---
function HomeRecommendationsView({ film, token, handleInteraction, loadNextBatch, setDetailFilm }) {
  const bannerUrl = film.bannerPath
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : film.backdropPath
    ? `https://image.tmdb.org/t/p/original/${film.backdropPath}`
    : `https://image.tmdb.org/t/p/w500/${film.posterPath}`;

  return (
    <div className="recommendations-page font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" style={{ backgroundImage: `url('/backgroundfade.png')` }} />

      <div className="film-scroll-area">
        <FilmCard film={film} onOpenDetail={() => setDetailFilm(film)} />
      </div>

      <div className="poster-fade" style={{ backgroundImage: `url('/posterfade.png')` }} />

      <ActionButtons
        films={[film]}
        setFilms={handleInteraction}
        token={token}
        loadNextBatch={loadNextBatch}
      />
    </div>
  );
}

// --- Main Container Component ---
export default function RecommendationsPage() {
  const token = localStorage.getItem("token");
  const [activeView, setActiveView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data state lifted to the parent component
  const [films, setFilms] = useState([]); // Home/Swiping list
  const [popularFilms, setPopularFilms] = useState([]); // ForYou Carousel
  const [recommendedFilms, setRecommendedFilms] = useState([]); // ForYou List
  const [detailFilm, setDetailFilm] = useState(null);

  // Function to load the next batch for the HOME view
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

  // Function to load all initial data (runs once on mount)
  useEffect(() => {
    if (!token) {
        setError("Please log in to get recommendations.");
        setLoading(false);
        return;
    }

    const loadInitialData = async () => {
        try {
            // 1. Home View Data (Initial batch for swiping)
            await loadNextBatch();

            // 2. For You Page Data (Popular Now & Top Picks)
            const popular = await fetchRecommendations();
            setPopularFilms(popular || []);

            const recommendations = await fetchRecommendations();
            setRecommendedFilms(recommendations || []);

        } catch (err) {
            console.error("Failed to fetch initial data", err);
            setError("Could not load initial data.");
        } finally {
            setLoading(false);
        }
    };

    loadInitialData();
  }, [token, loadNextBatch]);

  // Handler for swiping action in Home view
  const handleInteraction = (filmId) => {
    setFilms((prev) => {
      const updated = prev.filter((f) => f.id !== filmId);
      if (updated.length === 0) {
        // Automatically loads next batch if list is empty
        loadNextBatch();
      }
      return updated;
    });
  };

  const film = useMemo(() => films[0], [films]);

  if (!token) {
    return <div className="empty-state font-kino">Please log in to get recommendations.</div>;
  }
  
  if (loading) {
    return <div className="empty-state font-kino">Loading initial data...</div>;
  }

  const renderContent = () => {
    if (activeView === 'forYou') {
      return (
        <ForYouPage 
          popularFilms={popularFilms} 
          recommendedFilms={recommendedFilms} 
        />
      );
    }

    // Default 'home' view rendering
    if (!film) {
      return <div className="empty-state font-kino">{error || "No more films!"}</div>;
    }

    return (
      <HomeRecommendationsView 
        film={film} 
        token={token} 
        loadNextBatch={loadNextBatch} 
        handleInteraction={handleInteraction} 
        setDetailFilm={setDetailFilm} 
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
          films={films}
          setFilms={setFilms}
          token={token}
          loadNextBatch={loadNextBatch}
        />
      )}
    </>
  );
}