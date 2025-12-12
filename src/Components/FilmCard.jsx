import React from "react";
// Styles managed globally in RecommendationsPage.css

export default function FilmCard({ film, onOpenDetail }) {
  if (!film) return null;

  const posterUrl = film.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : film.bannerPath 
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : null;

  return (
    <div className="film-card">
      {/* Moved onClick here and added pointer cursor.
        This fixes the "Double Click" bug on mobile where the first tap 
        is often captured by hover states or image focus.
      */}
      <div 
        className="poster-container" 
        onClick={onOpenDetail}
        style={{ cursor: 'pointer' }}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="film-card-poster"
            loading="lazy"
            decoding="async"
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