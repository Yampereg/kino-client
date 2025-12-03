import React from "react";
import "./FilmCard.css"; 

export default function FilmCard({ film, onOpenDetail }) {
  const posterUrl = film.posterPath 
    ? `https://image.tmdb.org/t/p/w500/${film.posterPath}`
    : null;

  return (
    <main className="film-card">
      <div className="poster-container">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="film-card-poster"
            draggable="false"
            onClick={onOpenDetail}
          />
        ) : (
          <div className="film-card-poster">
            {film.title}
          </div>
        )}
      </div>

      <h1 className="film-title">
        {film.title}
      </h1>

      <div className="film-genres">
        {(film.genres || []).slice(0, 4).map((g) => (
          <span key={g.id ?? g.name} className="genre-tag">
            {g.name}
          </span>
        ))}
      </div>

      {film.overview && <p className="film-overview">{film.overview}</p>}
    </main>
  );
}