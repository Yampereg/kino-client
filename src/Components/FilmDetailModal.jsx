import React from 'react';
import './FilmDetailModal.css';

export default function FilmDetailModal({ film, onClose }) {
  if (!film) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img
          className="modal-banner"
          src={`https://image.tmdb.org/t/p/original/${film.bannerPath}`}
          alt={film.title}
        />
        <h1>{film.title} <span className="vote-average">★ {film.voteAverage.toFixed(1)}</span></h1>
        <p className="overview">{film.overview}</p>
        <div className="meta">
          <span>{new Date(film.releaseDate).getFullYear()}</span>
          <span>• {film.runtime}m</span>
          <span>• {film.originCountry.join(', ')}</span>
        </div>
        <div className="directors">
          <strong>Directors:</strong> {film.directors.map(d => d.name).join(', ')}
        </div>
        <div className="actors">
          <strong>Actors:</strong> {film.actors.slice(0, 5).map(a => a.name).join(', ')}{film.actors.length > 5 && ` +${film.actors.length - 5}`}
        </div>
      </div>
    </div>
  );
}
