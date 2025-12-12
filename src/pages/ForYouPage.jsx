/* src/pages/ForYouPage.jsx */
import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

export default function ForYouPage({ popularFilms, recommendedFilms, onRefresh, onFilmClick, isRefreshing }) {
  return (
    <div className="for-you-page">
      <div className="content-scroll-area">
        <PageHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />

        <section className="section">
          <h2 className="section-title">Top Picks For You</h2>
          
          <FilmCarousel 
             films={recommendedFilms} 
             // Source: 'carousel'
             onFilmClick={(f) => onFilmClick(f, 'carousel')}
          />
        </section>

        <section className="section">
          <h2 className="section-title">Popular Now</h2>
          {/* Added onFilmClick with 'popular' source */}
          <FilmList 
            films={popularFilms} 
            onFilmClick={(f) => onFilmClick(f, 'popular')} 
          />
        </section>
        
        <div className="page-footer">KINO</div>
      </div>
    </div>
  );
}