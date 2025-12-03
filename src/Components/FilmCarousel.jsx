import React from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  return (
    <div className="film-carousel-wrapper">
      <div className="film-carousel-container">
        {films.slice(0, 7).map((film, index) => (
          <div key={index} className="film-carousel-item">
            {getPosterUrl(film.posterPath) ? (
              <img 
                src={getPosterUrl(film.posterPath)} 
                alt={film.title || "Film Poster"} 
                className="film-poster" 
              />
            ) : (
              <div className="missing-poster">
                {film.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}