import React, { useState } from "react";
import "./FilmDetailModal.css";
import ActionButtons from "../Components/ActionButtons";

export default function FilmDetailModal({ film, onClose, films, setFilms, token, loadNextBatch }) {
  if (!film) return null;

  const bannerUrl = film.bannerPath
    ? `https://image.tmdb.org/t/p/original/${film.bannerPath}`
    : film.backdropPath
    ? `https://image.tmdb.org/t/p/original/${film.backdropPath}`
    : `https://image.tmdb.org/t/p/w500/${film.posterPath}`;

  const posterUrl = film.posterPath ? `https://image.tmdb.org/t/p/w500/${film.posterPath}` : bannerUrl;

  const directors = (film.directors || []).map((d) => d.name).join(" · ");
  const actors = (film.actors || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  // state for expanded actors
  const [expandedActors, setExpandedActors] = useState(false);

  const visibleActors = expandedActors ? actors : actors.slice(0, 4);
  const extraCount = Math.max(0, actors.length - visibleActors.length);

  const actorImg = (p) =>
    p && p.length
      ? `https://image.tmdb.org/t/p/original/${p}`
      : posterUrl || bannerUrl || "";

  const wrappedLoadNextBatch = async () => {
    if (loadNextBatch) await loadNextBatch();
    onClose();
  };

  // build stars array from rating (out of 10 => convert to 5 scale)
  const buildStars = (score) => {
    const stars = [];
    const ratingOutOfFive = (score || 0) / 2;
    for (let i = 1; i <= 5; i++) {
      if (ratingOutOfFive >= i) {
        stars.push("/fullstar.png");
      } else if (ratingOutOfFive >= i - 0.5) {
        stars.push("/halfstar.png");
      } else {
        stars.push("/emptystar.png");
      }
    }
    return stars;
  };


  const stars = buildStars(film.voteAverage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Banner */}
        <div
          className="modal-banner"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
        <div className="banner-fade" />

        {/* Scrollable content */}
        <div className="modal-content font-kino">
          <div className="modal-header">
            <div className="header-left">
              {/* Poster now closes modal on click */}
              <img
                src={posterUrl}
                alt={film.title}
                className="modal-poster"
                onClick={onClose}
              />
              <div className="poster-meta">
                <span>{film.releaseDate?.split("-")[0]}</span> •
                <span>
                  {film.runtime
                    ? `${Math.floor(film.runtime / 60)}h ${film.runtime % 60}m`
                    : ""}
                </span>
              </div>
              {/* Stars under year/runtime */}
              <div className="poster-rating">
                {stars.map((s, idx) => (
                  <img key={idx} src={s} alt="star" />
                ))}
              </div>
            </div>

            <div className="header-right">
              <div className="title-row">
                <h1 className="modal-title">{film.title}</h1>
              </div>

              <div className="modal-tags">
                {(film.genres || []).map((g) => (
                  <span key={g.id ?? g.name} className="genre-tag">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Overview */}
          {film.overview && <p className="modal-overview">{film.overview}</p>}

          {/* Actors */}
          {actors.length > 0 && (
            <div
              className={`actors-section ${
                visibleActors.length <= 3 ? "centered" : ""
              }`}
            >
              <div className="actors-row">
                {visibleActors.map((a) => (
                  <div className="actor-item" key={a.id}>
                    <img
                      src={actorImg(a.profilePath)}
                      alt={a.name}
                      className="actor-photo"
                    />
                    <div className="actor-name">{a.name}</div>
                  </div>
                ))}
                {!expandedActors && extraCount > 0 && (
                  <div
                    className="actor-item actor-more"
                    onClick={() => setExpandedActors(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="actor-more-circle">+{extraCount}</div>
                    <div className="actor-name">more</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Directors */}
          {directors && (
            <div className="modal-directors">
              <strong>
                {(film.directors || []).length > 1 ? "Directors" : "Director"}
              </strong>
              &nbsp; · &nbsp; {directors}
            </div>
          )}

          {/* Credits */}
          <div className="modal-credits">
            {film.writers?.length > 0 && (
              <div>
                <strong>Writers:</strong> {film.writers.join(" · ")}
              </div>
            )}
          </div>

          {/* Sticky bottom action bar */}
          <div className="modal-bottom-container">
            <ActionButtons
              films={[film]}
              setFilms={setFilms}
              token={token}
              loadNextBatch={wrappedLoadNextBatch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
