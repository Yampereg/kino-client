import React, { useState } from "react";
import "./FilmDetailModal.css";
import ActionButtons from "../Components/ActionButtons";

// --- Custom Star Components ---
// 1. The Base SVG geometry (Shared)
const StarSvg = ({ fill }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke="none" style={{ display: 'block' }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// 2. The Logic Component
const StarIcon = ({ type }) => {
  const gold = "#FFD700";
  const gray = "#555";

  if (type === "full") {
    return <StarSvg fill={gold} />;
  } 
  
  if (type === "half") {
    return (
      <div style={{ position: "relative", width: "18px", height: "18px", display: "inline-block" }}>
        {/* Background Gray Star */}
        <div style={{ position: "absolute", inset: 0 }}>
          <StarSvg fill={gray} />
        </div>
        {/* Foreground Gold Star (Clipped to 50%) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", overflow: "hidden" }}>
          <StarSvg fill={gold} />
        </div>
      </div>
    );
  }

  // Empty
  return <StarSvg fill={gray} />;
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

  // Star Calculation Logic
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
        
        {/* CLOSE BUTTON */}
        {/* Added z-index 1000 and padding to ensure it catches clicks */}
        <button 
            className="close-button" 
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }} 
            aria-label="Close"
        >
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
              
              {/* Star Rating Row */}
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
          
          <div style={{ height: '30px' }} />
        </div>

        {/* ROW 2: Sticky Bottom Actions */}
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