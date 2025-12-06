import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules"; 
import "swiper/css";
import "swiper/css/pagination"; 
import "./FilmCarousel.css";

export default function FilmCarousel({ films, onFilmClick }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500/${path}` : null;

  if (!films || films.length === 0) return null;

  return (
    <div className="film-carousel-wrapper">
      <Swiper
        modules={[Pagination]} 
        pagination={{ clickable: true, dynamicBullets: true }} 
        spaceBetween={24}
        slidesPerView={'auto'}
        centeredSlides={true}
        loop={true}
        className="film-swiper"
      >
        {films.map((film) => (
          // CRITICAL FIX: Use film.id as key, NOT index. 
          // This allows React to correctly remove specific slides when data changes.
          <SwiperSlide key={film.id} className="film-swiper-slide">
            {({ isActive }) => (
              <div 
                className={`film-carousel-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (onFilmClick) onFilmClick(film);
                }}
                style={{ cursor: onFilmClick ? 'pointer' : 'default' }}
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
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}