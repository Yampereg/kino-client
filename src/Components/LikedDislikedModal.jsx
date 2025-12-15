/* src/Components/LikedDislikedModal.jsx */
import React, { useEffect, useState } from "react";
import FilmDetailModal from "./FilmDetailModal";
import { fetchLikedFilms, fetchDislikedFilms } from "../api/filmService";
import "./LikedDislikedModal.css";

// Force solid background on the loader so we don't see the page behind it
const FullScreenLoader = () => (
  <div className="modal-loader-container">
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
    // Lock body scroll
    document.body.style.overflow = "hidden";
    
    const loadFilms = async () => {
      try {
        setLoading(true);
        // Add a small artificial delay to ensure transition isn't jarring
        // and data is fetched properly
        const [data] = await Promise.all([
           isLiked ? fetchLikedFilms() : fetchDislikedFilms(),
           new Promise(resolve => setTimeout(resolve, 500))
        ]);
        setFilms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch films", error);
        setFilms([]);
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
      {/* 1. Header is always visible unless loading takes over completely */}
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

      {/* 2. Content Area */}
      {loading ? (
        <FullScreenLoader />
      ) : (
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
                    <img src={posterUrl} alt={film.title} loading="lazy"/>
                  ) : (
                    <div className="no-poster">
                      <span>{film.title}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-message">
              <h2>No films found</h2>
              <p>Films you {isLiked ? "like" : "dislike"} will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. Detail Modal (Nested) */}
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