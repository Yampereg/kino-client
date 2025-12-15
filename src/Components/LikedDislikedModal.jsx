/* src/Components/LikedDislikedModal.jsx */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import FilmDetailModal from "./FilmDetailModal";
import "./LikedDislikedModal.css";

export default function LikedDislikedModal({ type, films, onClose }) {
  const [sortBy, setSortBy] = useState("date");
  const [selectedFilm, setSelectedFilm] = useState(null);

  const isLiked = type === "liked";
  const title = isLiked ? "Liked Films" : "Disliked Films";

  useEffect(() => {
    console.log("LikedDislikedModal: MOUNTED. Films count:", films?.length);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [films]);

  const getSortedFilms = () => {
    if (!films || !Array.isArray(films)) return [];
    
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
        zIndex: 999999, /* Covers everything including TopNav */
        overflowY: 'auto',
        fontFamily: '"KinoFont", sans-serif',
        display: 'flex',
        flexDirection: 'column'
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

      {/* Content - 4 Column Grid with EVEN BIGGER posters */}
      <div 
        className="films-grid" 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', /* Even bigger gap */
          padding: '0px 1rem 3rem', /* More padding */
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
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
                style={{ 
                  aspectRatio: '2/3', 
                  cursor: 'pointer', 
                  position: 'relative',
                  borderRadius: '12px' /* Bigger radius for larger cards */
                }}
              >
                {posterUrl ? (
                  <img 
                    src={posterUrl} 
                    alt={film.title} 
                    loading="lazy"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '12px' 
                    }}
                  />
                ) : (
                  <div className="no-poster" style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: '#222', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '12px'
                  }}>
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

      {/* Nested Detail Modal - EVEN HIGHER z-index */}
      {selectedFilm && (
        <div style={{ zIndex: 9999999 }}> {/* Extra layer to ensure it's on top */}
          <FilmDetailModal
            film={selectedFilm}
            onClose={() => setSelectedFilm(null)}
            showActions={false} 
          />
        </div>
      )}
    </div>,
    document.body
  );
}