// File: src/Components/FilmCard.jsx

import React from 'react';
import './FilmCard.css';
import eyeIcon from '../assets/eye-icon.svg'; // optional: if you want a detail button

export default function FilmCard({ film, onClickLike, onClickDislike, onClickSuperlike, onShowDetails }) {
  return (
    <div className="film-card">
      <img
        className="film-poster"
        src={`https://image.tmdb.org/t/p/w500/${film.posterPath}`}
        alt={film.title}
      />
      <div className="film-overlay">
        <h2 className="film-title">{film.title}</h2>
        <div className="film-genres">
          {film.genres.slice(0, 4).map((genre) => (
            <span key={genre.id} className="genre-tag">{genre.name}</span>
          ))}
          {film.genres.length > 4 && (
            <span className="genre-tag">+{film.genres.length - 4}</span>
          )}
        </div>
      </div>

      <div className="film-actions">
        <button className="action-button dislike" onClick={onClickDislike}>👎</button>
        <button className="action-button superlike" onClick={onClickSuperlike}>⭐</button>
        <button className="action-button like" onClick={onClickLike}>👍</button>
      </div>
    </div>
  );
}
