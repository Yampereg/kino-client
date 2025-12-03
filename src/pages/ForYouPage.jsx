import React, { useState, useEffect } from "react";
import TopNav from "../Components/TopNav"; 
import PageHeader from "../Components/PageHeader";
import FilmCarousel from "../Components/FilmCarousel";
import FilmList from "../Components/FilmList";
import { fetchRecommendations } from "../api/filmService";
import "./ForYouPage.css";

export default function ForYouPage() {
  const [recommendedFilms, setRecommendedFilms] = useState([]);
  const [popularFilms, setPopularFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please log in to view recommendations.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Fetch data for the top carousel (Popular Now)
        const popular = await fetchRecommendations();
        setPopularFilms(popular || []);

        // Fetch data for the bottom list (Top Picks For U)
        const recommendations = await fetchRecommendations();
        setRecommendedFilms(recommendations || []);
      } catch (err) {
        console.error("Failed to fetch film data:", err);
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (!token) {
    return <div className="empty-state">Please log in to view this page.</div>;
  }

  if (loading) {
    return <div className="empty-state">Loading...</div>;
  }

  if (error) {
    return <div className="empty-state error-message">{error}</div>;
  }

  return (
    <div className="for-you-page">
      <TopNav></TopNav>

      {/* New Header component from the UI/UX image */}
      <PageHeader />

      <div className="content-scroll-area">
        
        {/* Top Carousel Section: Popular Now (based on image_e2eb9f.png) */}
        <section className="section">
          <h2 className="section-title">Popular Now</h2>
          <FilmCarousel films={popularFilms} />
        </section>

        {/* Bottom List Section: Top Picks For U (based on image_e2eb9f.png) */}
        <section className="section">
          <h2 className="section-title">Top Picks For U</h2>
          <FilmList films={recommendedFilms} />
        </section>
        
        <div className="page-footer">KINO</div>
      </div>
    </div>
  );
}