import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

export default function ForYouPage({ popularFilms, recommendedFilms }) {
  return (
    <div className="for-you-page">
      {/* FIX: PageHeader was here. 
         It has been moved INSIDE content-scroll-area below. 
      */}

      <div className="content-scroll-area">
        {/* NOW IT IS HERE: This ensures it respects the padding-top */}
        <PageHeader />

        <section className="section">
          <h2 className="section-title">Popular Now</h2>
          <FilmCarousel films={popularFilms} />
        </section>

        <section className="section">
          <h2 className="section-title">Top Picks For U</h2>
          <FilmList films={recommendedFilms} />
        </section>
        
        <div className="page-footer">KINO</div>
      </div>
    </div>
  );
}