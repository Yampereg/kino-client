// File: src/pages/RecommendationsPage.jsx
import React, { useState, useEffect } from 'react';
import { fetchNextFilms, sendInteraction } from '../api/filmService';
import FilmDetailModal from '../Components/FilmDetailModal';
import './RecommendationsPage.css';

export default function RecommendationsPage() {
  const token = localStorage.getItem('token');
  const [films, setFilms] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [detailFilm, setDetailFilm] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (token) loadNextBatch();
  }, [token]);

  const loadNextBatch = async () => {
    setIsProcessing(true);
    try {
      const nextFilms = await fetchNextFilms(token);
      setFilms(nextFilms.slice(0, 3)); // always 3 per batch
      setBatchIndex(0);
    } catch (err) {
      console.error('Failed to fetch films', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInteraction = async (type) => {
    if (isProcessing) return;

    const film = films[batchIndex];
    if (!film) return;

    setIsProcessing(true);
    try {
      // wait for server confirmation before moving forward
      await sendInteraction(token, film.id, type);

      if (batchIndex === films.length - 1) {
        // last film in batch — fetch next batch only after all interactions finished
        await loadNextBatch();
      } else {
        setBatchIndex(batchIndex + 1);
      }
    } catch (err) {
      console.error(`Failed to ${type} film`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwipe = (direction) => {
    const type = direction === 'right' ? 'like' : 'dislike';
    handleInteraction(type);
  };

  const handleSuperlike = () => handleInteraction('superlike');

  const film = films[batchIndex];
  if (!film) return <div className="empty-state">No more films!</div>;

  return (
    <div className="recommendations-page">
      <div className="banner-container">
        <img
          src={`https://image.tmdb.org/t/p/original/${film.bannerPath}`}
          alt="banner"
          className="banner-image"
        />
        <div className="banner-fade"></div>
      </div>

      <div className="film-card">
        <img
          src={`https://image.tmdb.org/t/p/w500/${film.posterPath}`}
          alt={film.title}
          className="film-card-poster"
        />
        <h2 className="film-title font-kino">{film.title}</h2>
        <div className="film-genres scroll-x font-kino">
          {film.genres.map((g) => (
            <span key={g.id} className="genre-tag">{g.name}</span>
          ))}
        </div>
        <p className="film-overview font-kino-light">{film.overview}</p>

        <div className="action-buttons">
          <button
            className="icon-button dislike"
            onClick={() => handleSwipe('left')}
            disabled={isProcessing}
          >
            💔
          </button>
          <button
            className="maybe-button"
            onClick={handleSuperlike}
            disabled={isProcessing}
          >
            Maybe
          </button>
          <button
            className="icon-button like"
            onClick={() => handleSwipe('right')}
            disabled={isProcessing}
          >
            🤍
          </button>
        </div>
      </div>

      {detailFilm && (
        <FilmDetailModal film={detailFilm} onClose={() => setDetailFilm(null)} />
      )}
    </div>
  );
}
