/* FilmCarousel.jsx */
import React, { useRef, useEffect, useState } from "react";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const scrollRef = useRef(null);
  const itemsRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || films.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
        rootMargin: "0px -45% 0px -45%"
      }
    );

    itemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [films]);

  return (
    <div className="film-carousel-wrapper">
      <div className="film-carousel-container" ref={scrollRef}>
        {films.map((film, index) => (
          <div 
            key={film.id || index} 
            className={`film-carousel-item ${index === activeIndex ? 'active' : ''}`}
            ref={el => itemsRef.current[index] = el}
            data-index={index}
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