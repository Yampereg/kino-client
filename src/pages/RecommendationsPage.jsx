import React, { useState, useEffect, useMemo } from 'react';
import { fetchNextFilms, sendInteraction } from '../api/filmService';
import FilmDetailModal from '../Components/FilmDetailModal';
import './RecommendationsPage.css';

export default function RecommendationsPage() {
  const token = localStorage.getItem('token');
  const [films, setFilms] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [detailFilm, setDetailFilm] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    loadNextBatch();
  }, [token]);

  const loadNextBatch = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const nextFilms = await fetchNextFilms(token);
      const safe = Array.isArray(nextFilms) ? nextFilms.slice(0, 3) : [];
      setFilms(safe);
      setBatchIndex(0);
    } catch (err) {
      console.error('Failed to fetch films', err);
      setError('Could not load films.');
    } finally {
      setIsProcessing(false);
    }
  };

const handleInteraction = async (type) => {
  if (isProcessing) return;
  const film = films[batchIndex];
  if (!film) return;

  setIsProcessing(true);
  setError('');

  try {
    await sendInteraction(token, film.id, type);

    if (batchIndex >= films.length - 1) {
      await loadNextBatch();
    } else {
      setBatchIndex((i) => i + 1);
      setIsProcessing(false); // re-enable buttons immediately after increment
    }
  } catch (err) {
    console.error(`Failed to ${type} film`, err);
    setError(`Failed to ${type}.`);
    setIsProcessing(false); // re-enable buttons on error
  }
};


  const handleSwipe = (direction) => {
    const type = direction === 'right' ? 'like' : 'dislike';
    handleInteraction(type);
  };

  const handleSuperlike = () => handleInteraction('superlike');

  const film = useMemo(() => films[batchIndex], [films, batchIndex]);

  if (!token) {
    return (
      <div className="empty-state font-kino">
        Please log in to get recommendations.
      </div>
    );
  }

  if (!film) {
    return (
      <div className="empty-state font-kino">
        {error || 'No more films!'}
      </div>
    );
  }

  const bannerUrl = film.bannerPath
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : (film.backdropPath
        ? `https://image.tmdb.org/t/p/original/${film.backdropPath}`
        : `https://image.tmdb.org/t/p/w500/${film.posterPath}`);

  const posterUrl = `https://image.tmdb.org/t/p/w500/${film.posterPath}`;

  return (
    <div className="recommendations-page font-kino">
      {/* Background layers */}
      <div
        className="background-banner"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />
      <div
        className="background-fade"
        style={{ backgroundImage: `url('/backgroundfade.png')` }}
      />


      {/* Top nav */}
      <header className="top-nav">
        <span className="nav-item active">Home</span>
        <span className="nav-sep">|</span>
        <span className="nav-item">For You</span>
      </header>


<main className="film-card">
  <img
    src={posterUrl}
    alt={film.title}
    className="film-card-poster"
    draggable="false"
  />
  <h1 className="film-title text-5xl font-bold mt-6 mb-6">
    {film.title}
  </h1>
  <div className="film-genres">
    {(film.genres || []).slice(0, 4).map((g) => (
      <span key={g.id ?? g.name} className="genre-tag">{g.name}</span>
    ))}
  </div>
  {film.overview && (
    <p className="film-overview">{film.overview}</p>
  )}
</main>

{/* Poster fade outside of film-card */}
<div
  className="poster-fade"
  style={{ backgroundImage: `url('/posterfade.png')` }}
/>


      {/* Action buttons */}
      <div className="action-buttons">
        <img
          src="/dislike.png"
          alt="Dislike"
          onClick={() => handleSwipe('left')}
          className="icon-image"
          style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.55 : 1 }}
        />
        <img
          src="/skip.png"
          alt="Skip"
          onClick={handleSuperlike}
          className="icon-image"
          style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.55 : 1 }}
        />
        <img
          src="/like.png"
          alt="Like"
          onClick={() => handleSwipe('right')}
          className="icon-image"
          style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.55 : 1 }}
        />
      </div>

      {detailFilm && (
        <FilmDetailModal film={detailFilm} onClose={() => setDetailFilm(null)} />
      )}
    </div>
  );
}
