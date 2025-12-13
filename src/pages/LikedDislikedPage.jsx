import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLikedFilms, fetchDislikedFilms } from "../api/filmService";
import FilmDetailModal from "../Components/FilmDetailModal";
import "./LikedDislikedPage.css";

export default function LikedDislikedPage({ type }) {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [sortType, setSortType] = useState("date");
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLiked = type === "liked";
  const title = isLiked ? "Liked Films" : "Disliked Films";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = isLiked ? await fetchLikedFilms() : await fetchDislikedFilms();
        setFilms(data || []);
      } catch (e) {
        console.error("Failed to load films", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLiked]);

  const handleSort = (e) => {
    setSortType(e.target.value);
  };

  // Sorting Logic
  const sortedFilms = [...films].sort((a, b) => {
    switch (sortType) {
      case "date": // Release Date (Newest first)
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      case "budget": // Higher budget first
        return (b.budget || 0) - (a.budget || 0);
      case "rating": // Higher rating first
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      case "popularity": // Higher popularity first
        return (b.popularity || 0) - (a.popularity || 0);
      case "runtime": // Longer runtime first
        return (b.runtime || 0) - (a.runtime || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="ld-page">
      <div className="ld-header">
        <div className="ld-header-left">
          <button className="ld-back-btn" onClick={() => navigate("/")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="ld-title">{title}</h1>
        </div>
        
        <div className="ld-controls">
          <div className="ld-sort-wrapper">
            <span className="ld-sort-label">Sort by</span>
            <select className="ld-sort-select" value={sortType} onChange={handleSort}>
              <option value="date">Release Date</option>
              <option value="budget">Budget</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popularity</option>
              <option value="runtime">Runtime</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ld-content">
        {loading ? (
            <div className="ld-message">Loading...</div>
        ) : sortedFilms.length === 0 ? (
            <div className="ld-message">No films found in this list.</div>
        ) : (
            <div className="ld-grid">
                {sortedFilms.map(film => (
                    <div key={film.id} className="ld-card" onClick={() => setSelectedFilm(film)}>
                        <div className="ld-poster-wrapper">
                            {film.posterPath ? (
                                <img 
                                    src={`https://image.tmdb.org/t/p/w500/${film.posterPath}`} 
                                    alt={film.title} 
                                    className="ld-poster"
                                />
                            ) : (
                                <div className="ld-poster-missing">
                                    <span>{film.title}</span>
                                </div>
                            )}
                            <div className="ld-overlay">
                                <span className="ld-view-details">View</span>
                            </div>
                        </div>
                        <div className="ld-card-info">
                             <div className="ld-card-title">{film.title}</div>
                             <div className="ld-card-meta">
                                {sortType === 'rating' && `★ ${film.voteAverage?.toFixed(1)}`}
                                {sortType === 'date' && (film.releaseDate?.split('-')[0] || 'N/A')}
                                {sortType === 'runtime' && `${film.runtime} min`}
                                {sortType === 'popularity' && `Pop: ${Math.round(film.popularity)}`}
                                {sortType === 'budget' && `$${(film.budget/1000000).toFixed(0)}M`}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
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