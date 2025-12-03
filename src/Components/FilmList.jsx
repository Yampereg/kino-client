// src/Components/FilmList.jsx
import React from "react";
import "./FilmList.css";

export default function FilmList({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w200${path}` : null;

  return (
    <div className="film-list-container">
      {films.slice(0, 5).map((film, index) => (
        <div key={index} className="film-list-item">
          <div className="list-poster-wrapper">
            {getPosterUrl(film.posterPath) ? (
              <img 
                src={getPosterUrl(film.posterPath)} 
                alt={film.title || "Film Poster"} 
                className="list-poster" 
              />
            ) : (
              <div className="list-poster missing-poster-list">
                P
              </div>
            )}
          </div>
          <div className="list-info">
            <div className="list-title">{film.title || 'Unknown Title'}</div>
            <div className="list-rating">
              ⭐ {film.vote_average ? film.vote_average.toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}