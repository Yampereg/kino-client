import React, { useState, useEffect, useMemo, useCallback } from "react";
import { fetchNextFilms, fetchRecommendations } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import "./RecommendationsPage.css";

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

export default function RecommendationsPage() {
  const token = localStorage.getItem("token");
  const [activeView, setActiveView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [films, setFilms] = useState([]); 
  const [popularFilms, setPopularFilms] = useState([]); 
  const [recommendedFilms, setRecommendedFilms] = useState([]); 
  const [detailFilm, setDetailFilm] = useState(null);

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

  // Logic to load For You data (Extracted for re-use)
  const loadForYouData = useCallback(async () => {
    try {
      const popular = await fetchRecommendations();
      setPopularFilms(popular || []);
      const recommendations = await fetchRecommendations();
      setRecommendedFilms(recommendations || []);
    } catch (err) {
      console.error("Failed to fetch For You data", err);
    }
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await loadForYouData();
    // Short artificial delay to make the refresh feel substantial
    setTimeout(() => setLoading(false), 800);
  };

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
            console.error("Failed to fetch initial data", err);
            setError("Could not load initial data.");
        } finally {
            setTimeout(() => setLoading(false), 1200);
        }
    };

    loadInitialData();
  }, [token, loadNextBatch, loadForYouData]);

  const handleInteraction = (filmId) => {
    setFilms((prev) => {
      const updated = prev.filter((f) => f.id !== filmId);
      if (updated.length === 0) {
        loadNextBatch();
      }
      return updated;
    });
  };

  const film = useMemo(() => films[0], [films]);

  if (!token) return <div className="empty-state font-kino">Please log in to get recommendations.</div>;
  
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
          onRefresh={handleRefresh} // Pass the refresh handler
        />
      );
    }

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