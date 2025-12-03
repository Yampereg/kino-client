// src/Components/FilmCarousel.jsx
import React from "react";
// Assumes 'films' prop is an array of film objects
// with properties like 'posterPath'

const filmPosterStyle = {
  width: '180px',
  height: '270px',
  borderRadius: '12px',
  objectFit: 'cover',
  flexShrink: 0,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
  marginRight: '16px',
  background: '#333', /* Placeholder color */
  textAlign: 'center',
  lineHeight: '270px',
  fontSize: '0.9rem',
};

export default function FilmCarousel({ films }) {
  const getPosterUrl = (path) => 
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;

  return (
    <div style={{ display: 'flex', overflowX: 'scroll', padding: '0 16px 16px 16px', marginLeft: '-16px' }}>
      {films.map((film, index) => (
        <div key={index} style={filmPosterStyle}>
          {film.title || 'Poster Missing'}
        </div>
      ))}
    </div>
  );
}