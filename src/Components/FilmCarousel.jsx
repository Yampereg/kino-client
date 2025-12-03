// src/Components/FilmCarousel.jsx
import React from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;

  return (
    <div className="film-carousel-container">
      {films.map((film, index) => (
        <div key={index} className="film-carousel-item">
          {getPosterUrl(film.posterPath) ? (
            <img 
              src={getPosterUrl(film.posterPath)} 
              alt={film.title || "Film Poster"} 
              className="film-poster" 
            />
          ) : (
            <div className="film-poster missing-poster">
              {film.title || 'Poster Missing'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}