// src/Components/FilmCarousel.jsx
import React from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  // We only show a few films to maintain the 'centered card' look
  const carouselFilms = films.slice(0, 5);

  return (
    <div className="film-carousel-wrapper">
      <div className="film-carousel-container">
        {carouselFilms.map((film, index) => (
          <div 
            key={index} 
            className={`film-carousel-item film-item-${index}`}
            style={{ '--index': index }}
          >
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
        {/* Simple pagination dots */}
        <div className="pagination-dots">
            {[...Array(carouselFilms.length)].map((_, i) => (
                <span key={i} className={`dot ${i === 2 ? 'active-dot' : ''}`} />
            ))}
        </div>
      </div>
    </div>
  );
}