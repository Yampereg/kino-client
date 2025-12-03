import React, { useRef, useLayoutEffect, useState, useMemo } from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
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

    const container = scrollRef.current;
    let scrollLeft = container.scrollLeft;
    const itemWidth = 204;
    const singleSetWidth = films.length * itemWidth;

    if (scrollLeft < singleSetWidth / 2) {
      scrollLeft += singleSetWidth;
      container.scrollLeft = scrollLeft;
    } else if (scrollLeft >= singleSetWidth * 1.5) {
      scrollLeft -= singleSetWidth;
      container.scrollLeft = scrollLeft;
    }

    const centerPosition = scrollLeft + (window.innerWidth / 2);
    const index = Math.floor(centerPosition / itemWidth) % films.length;
    
    if (index !== activeIndex) {
      setActiveIndex(index);
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
          <div 
            key={`${index}-${film.id}`} 
            className={`film-carousel-item ${index % films.length === activeIndex ? 'active' : ''}`}
          >
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
      <div className="pagination-dots">
          {films.slice(0, 5).map((_, i) => (
              <span key={i} className={`dot ${i === (activeIndex % 5) ? 'active-dot' : ''}`} />
          ))}
      </div>
    </div>
  );
}