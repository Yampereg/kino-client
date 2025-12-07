import React, { useState } from "react";
import "./FilmDetailModal.css";
import ActionButtons from "../Components/ActionButtons";

// --- Custom Star Icons (SVG) ---
const StarIcon = ({ type }) => {
  const color = "#FFD700"; // Gold color
  const emptyColor = "#555"; // Dark gray for empty part

  if (type === "full") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  } else if (type === "half") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor={emptyColor} />
          </linearGradient>
        </defs>
        <path 
          fill="url(#halfGrad)" 
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
        />
      </svg>
    );
  } else {
    // Empty
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={emptyColor} stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
};

export default function FilmDetailModal({ film, onClose, films, setFilms, token, loadNextBatch }) {
  if (!film) return null;

  const bannerUrl = film.bannerPath
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : film.backdropPath
    ? `https://image.tmdb.org/t/p/original/${film.backdropPath}`
    : `https://image.tmdb.org/t/p/w500/${film.posterPath}`;

  const posterUrl = film.posterPath ? `https://image.tmdb.org/t/p/w500/${film.posterPath}` : bannerUrl;

  const directors = (film.directors || []).map((d) => d.name).join(" · ");
  const actors = (film.actors || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  const [expandedActors, setExpandedActors] = useState(false);

  const visibleActors = expandedActors ? actors : actors.slice(0, 4);
  const extraCount = Math.max(0, actors.length - visibleActors.length);

  const actorImg = (p) =>
    p && p.length
      ? `https://image.tmdb.org/t/p/original/${p}`
      : posterUrl || bannerUrl || "";

  const wrappedLoadNextBatch = async () => {
    if (loadNextBatch) await loadNextBatch();
    onClose();
  };

  // Generate array of star types based on score
  const getStarTypes = (score) => {
    const types = [];
    const ratingOutOfFive = (score || 0) / 2;
    for (let i = 1; i <= 5; i++) {
      if (ratingOutOfFive >= i) {
        types.push("full");
      } else if (ratingOutOfFive >= i - 0.5) {
        types.push("half");
      } else {
        types.push("empty");
      }
    }
    return types;
  };

  const starTypes = getStarTypes(film.voteAverage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Background Layers */}
        <div
          className="modal-banner"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
        <div className="banner-fade" />
        
        {/* Close Button - High Z-Index to ensure clickability */}
        <button className="close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* ROW 1: Scrollable Content */}
        <div className="modal-scroll-area font-kino">
          <div className="modal-header">
            <div className="header-left">
              <img
                src={posterUrl}
                alt={film.title}
                className="modal-poster"
                onClick={onClose}
              />
              <div className="poster-meta">
                <span>{film.releaseDate?.split("-")[0]}</span> •
                <span>
                  {film.runtime
                    ? `${Math.floor(film.runtime / 60)}h ${film.runtime % 60}m`
                    : ""}
                </span>
              </div>
              
              {/* Custom SVG Stars */}
              <div className="poster-rating">
                {starTypes.map((type, idx) => (
                  <StarIcon key={idx} type={type} />
                ))}
              </div>
            </div>

            <div className="header-right">
              <div className="title-row">
                <h1 className="modal-title">{film.title}</h1>
              </div>

              <div className="modal-tags">
                {(film.genres || []).map((g) => (
                  <span key={g.id ?? g.name} className="genre-tag">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Overview */}
          {film.overview && <p className="modal-overview">{film.overview}</p>}

          {/* Actors */}
          {actors.length > 0 && (
            <div className={`actors-section ${visibleActors.length <= 3 ? "centered" : ""}`}>
              <div className="actors-row">
                {visibleActors.map((a) => (
                  <div className="actor-item" key={a.id}>
                    <img
                      src={actorImg(a.profilePath)}
                      alt={a.name}
                      className="actor-photo"
                    />
                    <div className="actor-name">{a.name}</div>
                  </div>
                ))}
                {!expandedActors && extraCount > 0 && (
                  <div
                    className="actor-item actor-more"
                    onClick={() => setExpandedActors(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="actor-more-circle">+{extraCount}</div>
                    <div className="actor-name">more</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Directors */}
          {directors && (
            <div className="modal-directors">
              <strong>{(film.directors || []).length > 1 ? "Directors" : "Director"}</strong>
              &nbsp; · &nbsp; {directors}
            </div>
          )}

          {/* Credits */}
          <div className="modal-credits">
            {film.writers?.length > 0 && (
              <div>
                <strong>Writers:</strong> {film.writers.join(" · ")}
              </div>
            )}
          </div>
          
          {/* Spacer */}
          <div style={{ height: '30px' }} />
        </div>

        {/* ROW 2: Sticky Bottom Actions with Smooth Gradient */}
        <div className="modal-bottom-container">
          <div className="bottom-gradient-overlay" />
          <ActionButtons
            films={[film]}
            setFilms={setFilms}
            token={token}
            loadNextBatch={wrappedLoadNextBatch} 
          />
        </div>
      </div>
    </div>
  );
}