import React from "react";
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import "./ForYouPage.css";

export default function ForYouPage({ popularFilms, recommendedFilms, onRefresh }) {
  return (
    <div className="for-you-page">
      <div className="content-scroll-area">
        {/* Pass onRefresh down to the header */}
        <PageHeader onRefresh={onRefresh} />

        <section className="section">
          <h2 className="section-title">Top Picks For You</h2>
          <FilmCarousel films={recommendedFilms} />
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