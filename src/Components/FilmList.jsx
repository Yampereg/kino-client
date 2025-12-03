// src/Components/FilmList.jsx
import React from "react";
// Assumes 'films' prop is an array of film objects
// with properties like 'title' and 'vote_average'

const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
  padding: '8px 0',
  borderBottom: '1px solid #111',
};

const smallPosterStyle = {
  width: '60px',
  height: '90px',
  borderRadius: '6px',
  objectFit: 'cover',
  marginRight: '12px',
  background: '#333', /* Placeholder color */
  flexShrink: 0,
  textAlign: 'center',
  lineHeight: '90px',
  fontSize: '0.7rem',
};

export default function FilmList({ films }) {
  return (
    <div>
      {films.slice(0, 4).map((film, index) => (
        <div key={index} style={listItemStyle}>
          <div style={smallPosterStyle}>P</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{film.title || 'Unknown Title'}</div>
            <div style={{ fontSize: '0.8rem', color: '#acacac' }}>
              ⭐ {film.vote_average ? film.vote_average.toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}