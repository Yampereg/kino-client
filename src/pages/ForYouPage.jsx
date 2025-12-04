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
      {/* MOVED PageHeader inside content-scroll-area.
        This allows it to be pushed down by the padding-top 
        and scroll away with the rest of the content.
      */}
      <div className="content-scroll-area">
        <PageHeader />

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