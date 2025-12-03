import React, { useRef, useLayoutEffect, useMemo } from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const scrollRef = useRef(null);
  
  const displayFilms = useMemo(() => {
    return films.length > 0 ? [...films, ...films, ...films] : [];
  }, [films]);

  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  useLayoutEffect(() => {
    if (scrollRef.current && films.length > 0) {
      const singleSetWidth = films.length * 204;
      scrollRef.current.scrollLeft = singleSetWidth;
    }
  }, [films]);

  const handleScroll = () => {
    if (!scrollRef.current || films.length === 0) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const singleSetWidth = films.length * 204;

    if (scrollLeft < singleSetWidth / 2) {
      scrollRef.current.scrollLeft += singleSetWidth;
    } 
    else if (scrollLeft >= singleSetWidth * 1.5) {
      scrollRef.current.scrollLeft -= singleSetWidth;
    }
  };

  return (
    <div className="film-carousel-wrapper">
      <div 
        className="film-carousel-container" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
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