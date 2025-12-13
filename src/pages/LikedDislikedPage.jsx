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
        <h1 className="ld-title">{title}</h1>
        
        <div className="ld-controls">
          <div className="ld-sort-wrapper">
            <span className="ld-sort-label">Sort by:</span>
            <select className="ld-sort-select" value={sortType} onChange={handleSort}>
              <option value="date">Release Date</option>
              <option value="budget">Budget</option>
              <option value="rating">Ratings</option>
              <option value="popularity">Popularity</option>
              <option value="runtime">Runtime</option>
            </select>
          </div>

          <button className="ld-close-btn" onClick={() => navigate("/")}>
            ✕
          </button>
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
                                <div className="ld-poster-missing">No Image</div>
                            )}
                        </div>
                        <div className="ld-card-info">
                             <div className="ld-card-title">{film.title}</div>
                             <div className="ld-card-sub">
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