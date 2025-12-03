import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./FilmCarousel.css";

export default function FilmCarousel({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  if (!films || films.length === 0) return null;

  return (
    <div className="film-carousel-wrapper">
      <Swiper
        spaceBetween={24}
        slidesPerView={'auto'}
        centeredSlides={true}
        loop={true}
        className="film-swiper"
      >
        {films.map((film, index) => (
          <SwiperSlide key={`${index}-${film.id}`} className="film-swiper-slide">
            {({ isActive }) => (
              <div className={`film-carousel-item ${isActive ? 'active' : ''}`}>
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
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Visual Pagination Dots (Static representation based on length) */}
      <div className="pagination-dots">
          {films.slice(0, 5).map((_, i) => (
              <span key={i} className="dot" />
          ))}
      </div>
    </div>
  );
}