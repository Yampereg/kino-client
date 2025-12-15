/* src/pages/LikedDislikedPage.jsx */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilmCard from "../Components/FilmCard";
import FilmDetailModal from "../Components/FilmDetailModal";
import { fetchLikedFilms, fetchDislikedFilms } from "../api/filmService";
import "./LikedDislikedPage.css";

export default function LikedDislikedPage({ type }) {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date"); // default sort
  const [selectedFilm, setSelectedFilm] = useState(null);

  const isLiked = type === "liked";
  const title = isLiked ? "Liked Films" : "Disliked Films";

  useEffect(() => {
    const loadFilms = async () => {
      try {
        setLoading(true);
        const data = isLiked ? await fetchLikedFilms() : await fetchDislikedFilms();
        // Ensure data is an array
        setFilms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch films", error);
      } finally {
        setLoading(false);
      }
    };
    loadFilms();
  }, [type, isLiked]);

  // Sorting Logic
  const getSortedFilms = () => {
    const sorted = [...films];
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => 
          new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0)
        );
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

  const handleExit = () => {
    navigate("/recommendations");
  };

  if (loading) {
    return (
      <div className="interaction-page-container" style={{display:'grid', placeItems:'center'}}>
        <h2>Loading...</h2>
      </div>
    );
  }

  const displayedFilms = getSortedFilms();

  return (
    <div className="interaction-page-container">
      {/* Header */}
      <div className="interaction-header">
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

          <button className="exit-btn" onClick={handleExit} title="Back to For You">
            ✕
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="films-grid">
        {displayedFilms.length > 0 ? (
          displayedFilms.map((film) => (
            <FilmCard 
              key={film.id} 
              film={film} 
              onOpenDetail={() => setSelectedFilm(film)} 
            />
          ))
        ) : (
          <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#666', marginTop: '2rem'}}>
            No films found in this list.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFilm && (
        <FilmDetailModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          showActions={false} // View only mode
        />
      )}
    </div>
  );
}