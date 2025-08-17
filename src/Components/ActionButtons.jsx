import React, { useState } from "react";
import { sendInteraction } from "../api/filmService";
import "./ActionButtons.css";

export default function ActionButtons({ films, setFilms, token, loadNextBatch }) {
  const [batchIndex, setBatchIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInteraction = async (type) => {
    if (isProcessing) return;
    const film = films[batchIndex];
    if (!film) return;

    setIsProcessing(true);

    try {
      await sendInteraction(token, film.id, type);

      if (batchIndex >= films.length - 1) {
        await loadNextBatch();
        setBatchIndex(0);
      } else {
        setBatchIndex((i) => i + 1);
      }
    } catch (err) {
      console.error(`Failed to ${type} film`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwipe = (direction) => handleInteraction(direction === "right" ? "like" : "dislike");
  const handleSuperlike = () => handleInteraction("superlike");

  const btnStyle = {
    cursor: isProcessing ? "not-allowed" : "pointer",
    opacity: isProcessing ? 0.55 : 1,
  };

  return (
    <div className="action-buttons">
      <img src="/dislike.png" alt="Dislike" onClick={() => handleSwipe("left")} className="icon-image" style={btnStyle} />
      <img src="/skip.png" alt="Skip" onClick={handleSuperlike} className="icon-image" style={btnStyle} />
      <img src="/like.png" alt="Like" onClick={() => handleSwipe("right")} className="icon-image" style={btnStyle} />
    </div>
  );
}
