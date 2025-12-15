/* src/Components/LikedDislikedModal.jsx */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import FilmDetailModal from "./FilmDetailModal";
import "./LikedDislikedModal.css";

// Reuse loading screen component
const FullScreenLoader = () => (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: '#111111',
    zIndex: 100001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderTop: '2px solid #fff',
      borderRadius: '50%',
      animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      marginBottom: '20px'
    }} />
    <div style={{
      fontSize: '1.5rem',
      fontWeight: 900,
      letterSpacing: '4px',
      color: '#fff'
    }}>KINO</div>
  </div>
);

export default function LikedDislikedModal({ type, films, onClose }) {
  const [sortBy, setSortBy] = useState("date");
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLiked = type === "liked";
  const title = isLiked ? "Liked Films" : "Disliked Films";

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Simulate data ready check
    if (films !== undefined) {
      setIsLoading(false);
    }
  }, [films]);

  const getSortedFilms = () => {
    if (!films || films.length === 0) return [];
    
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

  return ReactDOM.createPortal(
    <div 
      className="liked-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#111111',
        zIndex: 100000, 
        overflowY: 'auto',
        fontFamily: '"KinoFont", sans-serif'
      }}
    >
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
      {isLoading ? (
        <div style={{ position: 'relative', height: '50vh' }}>
          <FullScreenLoader />
        </div>
      ) : (
        /* Content - Grid */
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
            <div style={{ color: '#888', textAlign: 'center', marginTop: '50px', gridColumn: '1/-1' }}>
              <h2>No films found</h2>
              <p>Films you {isLiked ? 'like' : 'dislike'} will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Nested Detail Modal */}
      {selectedFilm && (
        <FilmDetailModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          showActions={false} 
        />
      )}
    </div>,
    document.body
  );
}