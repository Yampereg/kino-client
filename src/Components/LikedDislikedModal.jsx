/* src/Components/LikedDislikedModal.jsx */
import React, { useEffect, useState } from "react";
import FilmDetailModal from "./FilmDetailModal";
import { fetchLikedFilms, fetchDislikedFilms } from "../api/filmService";
import "./LikedDislikedModal.css";

// Reusing the loader style locally to ensure it renders correctly
const FullScreenLoader = () => (
  <div className="loading-screen font-kino" style={{ position: 'fixed', inset: 0, zIndex: 3001 }}>
    <div className="loader-content">
      <div className="loader-ring"></div>
      <div className="loader-logo">KINO</div>
    </div>
  </div>
);

export default function LikedDislikedModal({ type, onClose }) {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [selectedFilm, setSelectedFilm] = useState(null);

  const isLiked = type === "liked";
  const title = isLiked ? "Liked Films" : "Disliked Films";

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    const loadFilms = async () => {
      try {
        setLoading(true);
        const data = isLiked ? await fetchLikedFilms() : await fetchDislikedFilms();
        setFilms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch films", error);
      } finally {
        setLoading(false);
      }
    };
    loadFilms();

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [type, isLiked]);

  const getSortedFilms = () => {
    const sorted = [...films];
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
      case "budget":
        return sorted.sort((a, b) => (b.budget || 0) - (a.budget || 0));
      case "rating":
        return sorted.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
      case "popularity":
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case "runtime":
        return sorted.sort((a, b) => (b.runtime || 0) - (a.runtime || 0));
      default:
        return sorted;
    }
  };

  const displayedFilms = getSortedFilms();

  return (
    <div className="liked-modal-overlay">
      {/* Header */}
      <div className="liked-modal-header">
        <h1 className="page-title">{title}</h1>
        
        <div className="header-controls">
          <div className="sort-container">
            <label className="sort-label">Sort by:</label>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Release Date</option>
              <option value="budget">Budget</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popularity</option>
              <option value="runtime">Runtime</option>
            </select>
          </div>

          <button className="exit-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <FullScreenLoader />}

      {/* Grid - Only Posters */}
      {!loading && (
        <div className="films-grid">
          {displayedFilms.length > 0 ? (
            displayedFilms.map((film) => {
               const posterUrl = film.posterPath 
                ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
                : film.bannerPath 
                ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
                : null;

              return (
                <div 
                  key={film.id} 
                  className="grid-poster-card"
                  onClick={() => setSelectedFilm(film)}
                >
                  {posterUrl ? (
                    <img 
                      src={posterUrl} 
                      alt={film.title} 
                      loading="lazy"
                    />
                  ) : (
                    <div className="no-poster">
                      <span>{film.title}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#666', marginTop: '5rem'}}>
              No films found.
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedFilm && (
        <FilmDetailModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          showActions={false} 
        />
      )}
    </div>
  );
}