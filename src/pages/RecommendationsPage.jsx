// File: src/pages/RecommendationsPage.jsx
import React, { useState, useEffect } from 'react';
import { fetchNextFilms, sendInteraction } from '../api/filmService';
import FilmDetailModal from '../Components/FilmDetailModal';
import './RecommendationsPage.css';

export default function RecommendationsPage() {
  const token = localStorage.getItem('token');
  const [films, setFilms] = useState([]);
  const [topIndex, setTopIndex] = useState(0);
  const [detailFilm, setDetailFilm] = useState(null);

  useEffect(() => {
    loadMoreFilms();
  }, [token]);

  const loadMoreFilms = async () => {
    try {
      const newFilms = await fetchNextFilms(token);
      setFilms(prev => [...prev, ...newFilms]);
    } catch (err) {
      console.error('Failed to fetch films', err);
    }
  };

 const advanceToNextFilm = () => {
  setTopIndex(prev => {
    const nextIndex = prev + 1;

    // Only fetch when the current batch of 3 is finished
    if ((nextIndex % 3) === 0) {
      loadMoreFilms();
    }

    return nextIndex;
  });
};

  const handleSwipe = (direction) => {
    const film = films[topIndex];
    if (!film) return;
    advanceToNextFilm();
    const type = direction === 'right' ? 'like' : 'dislike';
    sendInteraction(token, film.id, type).catch(err =>
      console.error(`Failed to ${type} film`, err)
    );
  };

  const handleSuperlike = () => {
    const film = films[topIndex];
    if (!film) return;
    advanceToNextFilm();
    sendInteraction(token, film.id, 'superlike').catch(err =>
      console.error('Failed to superlike film', err)
    );
  };

  const film = films[topIndex];
  if (!film) return null;

  return (
    <div className="recommendations-page">
      {/* Blurred banner background */}
      <div className="banner-container">
        <img
          src={`https://image.tmdb.org/t/p/original/${film.bannerPath}`}
          alt="banner"
          className="banner-image"
        />
        <div className="banner-fade"></div>
      </div>

      {/* Poster and content */}
      <div className="film-card">
        <img
          src={`https://image.tmdb.org/t/p/w500/${film.posterPath}`}
          alt={film.title}
          className="film-card-poster"
        />

        <h2 className="film-title font-kino">{film.title}</h2>

        <div className="film-genres scroll-x font-kino">
          {film.genres.map(g => (
            <span key={g.id} className="genre-tag">{g.name}</span>
          ))}
        </div>

        <p className="film-overview font-kino-light">{film.overview}</p>

        {/* Action buttons */}
        <div className="action-buttons">
          <button className="icon-button dislike" onClick={() => handleSwipe('left')}>
            💔
          </button>
          <button className="maybe-button" onClick={handleSuperlike}>
            Maybe
          </button>
          <button className="icon-button like" onClick={() => handleSwipe('right')}>
            🤍
          </button>
        </div>
      </div>

      {/* Modal */}
      {detailFilm && (
        <FilmDetailModal film={detailFilm} onClose={() => setDetailFilm(null)} />
      )}
    </div>
  );
}
