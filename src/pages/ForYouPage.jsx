import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

// MODIFIED: Added isRefreshing prop
export default function ForYouPage({ popularFilms, recommendedFilms, onRefresh, onFilmClick, isRefreshing }) {
  return (
    <div className="for-you-page">
      <div className="content-scroll-area">
        {/* MODIFIED: Pass isRefreshing to PageHeader */}
        <PageHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />

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