import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

export default function ForYouPage({ popularFilms, recommendedFilms }) {
  // No token check needed here, as the parent component handles it.
  // No loading state needed here, as the parent component waits for data.
  
  return (
    <div className="for-you-page">
      <PageHeader />

      <div className="content-scroll-area">
        
        <section className="section">
          <h2 className="section-title">Popular Now</h2>
          {/* Use props for data */}
          <FilmCarousel films={popularFilms} />
        </section>

        <section className="section">
          <h2 className="section-title">Top Picks For U</h2>
          {/* Use props for data */}
          <FilmList films={recommendedFilms} />
        </section>
        
        <div className="page-footer">KINO</div>
      </div>
    </div>
  );
}