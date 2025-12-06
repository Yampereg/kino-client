import React, { useState } from "react";
import { sendInteraction } from "../api/filmService";
import "./ActionButtons.css";

export default function ActionButtons({ films, setFilms, token, loadNextBatch }) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Always target the first film in the passed array
  const currentFilm = films && films.length > 0 ? films[0] : null;

  const handleInteraction = async (type) => {
    if (isProcessing || !currentFilm) return;

    setIsProcessing(true);

    try {
      // 1. Send API call
      await sendInteraction(token, currentFilm.id, type);

      // 2. Remove film from Parent State (RecommendationsPage)
      // This triggers the Visual Removal AND the Counter
      if (setFilms) {
        setFilms((prevFilms) => prevFilms.filter((f) => f.id !== currentFilm.id));
      }
    } catch (err) {
      console.error(`Failed to ${type} film`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwipe = (direction) => handleInteraction(direction === "right" ? "like" : "dislike");
  
  // Skip just closes the modal (or loads next batch in Home view)
  const handleSkip = () => {
    if (loadNextBatch) loadNextBatch();
  };

  const btnStyle = {
    cursor: isProcessing ? "not-allowed" : "pointer",
    opacity: isProcessing ? 0.55 : 1,
  };

  if (!currentFilm) return null;

  return (
    <div className="action-buttons">
      <img src="/dislike.png" alt="Dislike" onClick={() => handleSwipe("left")} className="icon-image" style={btnStyle} />
      <img src="/skip.png" alt="Skip" onClick={handleSkip} className="icon-image" style={btnStyle} />
      <img src="/like.png" alt="Like" onClick={() => handleSwipe("right")} className="icon-image" style={btnStyle} />
    </div>
  );
}