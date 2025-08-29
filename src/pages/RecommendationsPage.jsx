import React, { useState, useEffect, useMemo } from "react";
import { fetchNextFilms } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import TopNav from "../Components/TopNav.jsx";
import FilmCard from "../Components/FilmCard";
import ActionButtons from "../Components/ActionButtons";
import "./RecommendationsPage.css";

export default function RecommendationsPage() {
  const token = localStorage.getItem("token");
  const [films, setFilms] = useState([]);
  const [detailFilm, setDetailFilm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    loadNextBatch();
  }, [token]);

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

  const handleInteraction = async (filmId) => {
    // Remove the specific film from the array
    setFilms((prev) => {
      const updated = prev.filter((f) => f.id !== filmId);
      if (updated.length === 0) {
        // If empty, load next batch automatically
        loadNextBatch();
      }
      return updated;
    });
  };

  const film = useMemo(() => films[0], [films]);

  if (!token) {
    return <div className="empty-state font-kino">Please log in to get recommendations.</div>;
  }

  if (!film) {
    return <div className="empty-state font-kino">{error || "No more films!"}</div>;
  }

  const bannerUrl = film.bannerPath
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : film.backdropPath
    ? `https://image.tmdb.org/t/p/original/${film.backdropPath}`
    : `https://image.tmdb.org/t/p/w500/${film.posterPath}`;

  return (
    <div className="recommendations-page font-kino">
      <div className="background-banner" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="background-fade" style={{ backgroundImage: `url('/backgroundfade.png')` }} />
      <TopNav />

      {/* NEW: scroll wrapper placed between banner and fixed actions */}
      <div className="film-scroll-area">
        <FilmCard film={film} onOpenDetail={() => setDetailFilm(film)} />
      </div>

      <div className="poster-fade" style={{ backgroundImage: `url('/posterfade.png')` }} />

      {/* ActionButtons remain fixed and unchanged */}
      <ActionButtons
        films={[film]}
        setFilms={handleInteraction}
        token={token}
        loadNextBatch={loadNextBatch}
      />

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
    </div>
  );
}
