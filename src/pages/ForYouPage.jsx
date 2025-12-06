import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

// 1. Accept onFilmClick here
export default function ForYouPage({ popularFilms, recommendedFilms, onRefresh, onFilmClick }) {
  console.log("ForYouPage received onFilmClick:", !!onFilmClick); // Debug log

  return (
    <div className="for-you-page">
      <div className="content-scroll-area">
        <PageHeader onRefresh={onRefresh} />

        <section className="section">
          <h2 className="section-title">Top Picks For You</h2>
          {/* 2. Pass it down here */}
          <FilmCarousel 
            films={recommendedFilms} 
            onFilmClick={onFilmClick} 
          />
        </section>

        <section className="section">
          <h2 className="section-title">Popular Now</h2>
          <FilmList films={popularFilms} />
        </section>
        
        <div className="page-footer">KINO</div>
      </div>
    </div>
  );
}