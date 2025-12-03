import React from "react";
import "./FilmList.css";

export default function FilmList({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w200/${path}` : null;

  return (
    <div className="film-list-container">
      {films.map((film, index) => (
        <div key={index} className="film-list-item">
          <div className="list-poster-wrapper">
            {getPosterUrl(film.posterPath) ? (
              <img 
                src={getPosterUrl(film.posterPath)} 
                alt={film.title} 
                className="list-poster" 
              />
            ) : (
              <div className="missing-poster-list">?</div>
            )}
          </div>
          <div className="list-info">
            <span className="list-title">{film.title}</span>
            <span className="list-rating">★ {film.vote_average ? film.vote_average.toFixed(1) : '0.0'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}