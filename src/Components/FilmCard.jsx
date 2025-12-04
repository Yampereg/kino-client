import React from "react";
// Styling is handled globally in RecommendationsPage.css 
// to ensure seamless scrolling integration.

export default function FilmCard({ film, onOpenDetail }) {
  if (!film) return null;

  const posterUrl = film.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  return (
    <div className="film-card">
      <div className="poster-container">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="film-card-poster"
            onClick={onOpenDetail}
          />
        ) : (
          <div className="film-card-poster placeholder">
            {film.title}
          </div>
        )}
      </div>

      <h1 className="film-title">
        {film.title}
      </h1>

      <div className="film-genres">
        {(film.genres || []).slice(0, 3).map((g) => (
          <span key={g.id || g.name} className="genre-tag">
            {g.name}
          </span>
        ))}
      </div>

      {film.overview && (
        <p className="film-overview">
          {film.overview}
        </p>
      )}
    </div>
  );
}