import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLikedFilms, fetchDislikedFilms } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import "./LikedDislikedPage.css";

const pageCache = {
  liked: null,
  disliked: null
};

export default function LikedDislikedPage({ type }) {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [sortType, setSortType] = useState("date");
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLiked = type === "liked";
  const title = isLiked ? "Liked Films" : "Disliked Films";

  const loadFilms = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && pageCache[type]) {
      setFilms(pageCache[type]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = isLiked ? await fetchLikedFilms() : await fetchDislikedFilms();
      const safeData = data || [];
      setFilms(safeData);
      pageCache[type] = safeData;
    } catch (e) {
      console.error("Failed to load films", e);
    } finally {
      setLoading(false);
    }
  }, [type, isLiked]);

  useEffect(() => {
    loadFilms();
  }, [loadFilms]);

  const handleRefresh = () => {
    loadFilms(true);
  };

  const handleSort = (e) => {
    setSortType(e.target.value);
  };

  const sortedFilms = [...films].sort((a, b) => {
    switch (sortType) {
      case "date": return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      case "budget": return (b.budget || 0) - (a.budget || 0);
      case "rating": return (b.voteAverage || 0) - (a.voteAverage || 0);
      case "popularity": return (b.popularity || 0) - (a.popularity || 0);
      case "runtime": return (b.runtime || 0) - (a.runtime || 0);
      default: return 0;
    }
  });

  return (
    <div className="ld-page">
      <div className="ld-header-top">
        {/* Navigation explicit to /foryou */}
        <button className="ld-back-btn" onClick={() => navigate("/foryou")}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="ld-title">{title}</h1>
        
        {/* Refresh Button with Spin Logic */}
        <button 
          className={`ld-refresh-btn ${loading ? 'spinning' : ''}`} 
          onClick={handleRefresh} 
          disabled={loading}
          title="Refresh List"
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M23 4v6h-6"></path>
             <path d="M1 20v-6h6"></path>
             <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
           </svg>
        </button>
      </div>

      <div className="ld-toolbar">
        <div className="ld-sort-group">
            <label className="ld-sort-label">Sort by</label>
            <div className="ld-select-wrapper">
                <select className="ld-sort-select" value={sortType} onChange={handleSort}>
                    <option value="date">Release Date</option>
                    <option value="budget">Budget</option>
                    <option value="rating">Rating</option>
                    <option value="popularity">Popularity</option>
                    <option value="runtime">Runtime</option>
                </select>
            </div>
        </div>
        <div className="ld-count">{films.length} Films</div>
      </div>

      <div className="ld-content">
        {/* Removed "Loading..." text. Only shows list or empty state when not loading */}
        {!loading && sortedFilms.length === 0 && (
            <div className="ld-status-msg">No films here yet.</div>
        )}

        {/* Content visible even if reloading, or just empty if initial load */}
        <div className="ld-grid-container">
            <div className="ld-grid">
                {sortedFilms.map(film => (
                    <div key={film.id} className="ld-card" onClick={() => setSelectedFilm(film)}>
                        <div className="ld-poster-container">
                            {film.posterPath ? (
                                <img 
                                    src={`https://image.tmdb.org/t/p/w300/${film.posterPath}`} 
                                    alt={film.title} 
                                    className="ld-poster-img"
                                />
                            ) : (
                                <div className="ld-poster-placeholder">
                                    <span>{film.title}</span>
                                </div>
                            )}
                            <div className="ld-hover-overlay">
                                <span className="ld-overlay-icon">↗</span>
                            </div>
                        </div>
                        <div className="ld-meta">
                            <h3 className="ld-film-title">{film.title}</h3>
                            <span className="ld-film-detail">
                                {sortType === 'rating' && `★ ${film.voteAverage?.toFixed(1)}`}
                                {sortType === 'date' && (film.releaseDate?.split('-')[0] || 'N/A')}
                                {sortType === 'runtime' && `${film.runtime} min`}
                                {sortType === 'popularity' && `Pop: ${Math.round(film.popularity)}`}
                                {sortType === 'budget' && `$${(film.budget/1000000).toFixed(0)}M`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

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