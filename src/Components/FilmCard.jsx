import React from "react";
import "./FilmCard.css";

export default function FilmCard({ film, onOpenDetail }) {
  const posterUrl = `https://image.tmdb.org/t/p/w500/${film.posterPath}`;

  return (
    <main className="film-card">
      <div className="poster-container">
        <img
          src={posterUrl}
          alt={film.title}
          className="film-card-poster"
          draggable="false"
          onClick={onOpenDetail}
        />
      </div>

      <h1 className="film-title text-5xl font-bold mt-6 mb-6">
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
