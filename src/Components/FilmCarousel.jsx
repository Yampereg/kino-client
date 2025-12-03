import React, { useRef, useLayoutEffect } from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const scrollRef = useRef(null);
  // Create 3 sets to allow infinite scrolling in both directions
  const displayFilms = films.length > 0 ? [...films, ...films, ...films] : [];

  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  useLayoutEffect(() => {
    if (scrollRef.current && films.length > 0) {
      const itemWidth = 180;
      const gap = 24;
      const singleSetWidth = films.length * (itemWidth + gap);
      
      // Start in the middle set
      scrollRef.current.scrollLeft = singleSetWidth;
    }
  }, [films]);

  const handleScroll = () => {
    if (!scrollRef.current || films.length === 0) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = 180;
    const gap = 24;
    const singleSetWidth = films.length * (itemWidth + gap);

    // If we scroll past the second set (too far right), jump back to start of middle set
    if (scrollLeft >= singleSetWidth * 2) {
      scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
    }
    // If we scroll into the first set (too far left), jump forward to end of middle set
    else if (scrollLeft <= 0) {
      scrollRef.current.scrollLeft = scrollLeft + singleSetWidth;
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