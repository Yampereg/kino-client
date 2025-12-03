import React, { useRef, useLayoutEffect } from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const scrollRef = useRef(null);
  const displayFilms = films.length > 0 ? [...films, ...films, ...films] : [];

  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  useLayoutEffect(() => {
    if (scrollRef.current && films.length > 0) {
      const itemWidth = 180;
      const gap = 24;
      const initialScroll = films.length * (itemWidth + gap);
      scrollRef.current.scrollLeft = initialScroll;
    }
  }, [films]);

  return (
    <div className="film-carousel-wrapper">
      <div className="film-carousel-container" ref={scrollRef}>
        {displayFilms.map((film, index) => (
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