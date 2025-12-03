import React, { useState, useEffect, useMemo } from "react";
import { fetchNextFilms } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import ForYouPage from "./ForYouPage.jsx";
import "./RecommendationsPage.css";

function HomeRecommendationsView({ film, token, loadNextBatch, handleInteraction, setDetailFilm }) {
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

export default function RecommendationsPage() {
  const token = localStorage.getItem("token");
  const [activeView, setActiveView] = useState('home');
  const [films, setFilms] = useState([]);
  const [detailFilm, setDetailFilm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || activeView !== 'home') return;
    loadNextBatch();
  }, [token, activeView]);

  const loadNextBatch = async () => {
    setError("");
    try {
      const nextFilms = await fetchNextFilms(token);
      const safe = Array.isArray(nextFilms) ? nextFilms.slice(0, 3) : [];
      setFilms(safe);
    } catch (err) {
      console.error("Failed to fetch films", err);
      setError("Could not load films.");
    }
  };

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

  const renderContent = () => {
    if (activeView === 'forYou') {
      return <ForYouPage />;
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

  if (!token) {
    return <div className="empty-state font-kino">Please log in to get recommendations.</div>;
  }
  
  // The TopNav is rendered here, above the content
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