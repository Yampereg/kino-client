import React from "react";
// Styles managed globally in RecommendationsPage.css to ensure layout consistency

export default function FilmCard({ film, onOpenDetail }) {
  if (!film) return null;

  const posterUrl = film.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : film.bannerPath 
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
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
          <div className="film-card-poster" style={{ display: 'grid', placeItems: 'center', background: '#333' }}>
            <span>{film.title}</span>
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