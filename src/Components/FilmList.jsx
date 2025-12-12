/* src/Components/FilmList.jsx */
import React from "react";
import "./FilmList.css";

export default function FilmList({ films, onFilmClick }) {
  const getPosterUrl = (path) =>
    path ? `https://image.tmdb.org/t/p/w200/${path}` : null;

  return (
    <div className="film-list-container">
      {films.map((film, index) => (
        <div 
            key={film.id || index} 
            className="film-list-item"
            // Added click handler and pointer style
            onClick={() => onFilmClick && onFilmClick(film)}
            style={{ cursor: "pointer" }}
        >
          <span className="list-number">{index + 1}</span>
          <div className="list-poster-wrapper">
            {getPosterUrl(film.posterPath) ? (
              <img
                src={getPosterUrl(film.posterPath)}
                alt={film.title}
                className="list-poster"
              />
            ) : (
              <div className="missing-poster-list"></div>
            )}
          </div>
          <div className="list-info">
            <span className="list-title">{film.title}</span>
            <div className="list-rating">
              <span className="star-icon">★</span>
              <span>{film.voteAverage ? film.voteAverage.toFixed(1) : '0.0'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}