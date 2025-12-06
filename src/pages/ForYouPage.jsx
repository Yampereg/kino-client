import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

// It receives 'onFilmClick' from RecommendationsPage and passes it to FilmCarousel
export default function ForYouPage({ popularFilms, recommendedFilms, onRefresh, onFilmClick }) {
  return (
    <div className="for-you-page">
      <div className="content-scroll-area">
        {/* Header handles the refresh pull */}
        <PageHeader onRefresh={onRefresh} />

        <section className="section">
          <h2 className="section-title">Top Picks For You</h2>
          
          {/* THE CAROUSEL */}
          <FilmCarousel 
             films={recommendedFilms} 
             onFilmClick={onFilmClick} // <--- Passing the "Open Modal" signal down
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