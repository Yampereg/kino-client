import React, { useEffect, useState } from "react";
import "./SettingsDrawer.css";
import { fetchLikedFilms, fetchDislikedFilms } from "../api/filmService";
import FilmDetailModal from "./FilmDetailModal";

export default function SettingsDrawer({ isOpen, onClose, userName, onLogout }) {
  const [currentView, setCurrentView] = useState("menu"); // 'menu', 'liked', 'disliked'
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset to menu when drawer closes (optional, for clean state next open)
      const timer = setTimeout(() => {
        setCurrentView("menu");
        setFilms([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fetch films when switching views
  useEffect(() => {
    async function loadFilms() {
      if (currentView === "menu") return;

      setLoading(true);
      try {
        let data = [];
        if (currentView === "liked") {
          data = await fetchLikedFilms();
        } else if (currentView === "disliked") {
          data = await fetchDislikedFilms();
        }
        setFilms(data || []);
      } catch (err) {
        console.error("Failed to load films", err);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadFilms();
    }
  }, [currentView, isOpen]);

  const displayedName = userName || "User";

  const handleBack = () => {
    setCurrentView("menu");
    setFilms([]);
  };

  const renderPoster = (path) =>
    path ? `https://image.tmdb.org/t/p/w200/${path}` : null;

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`drawer-panel ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          {currentView === "menu" ? (
            <button className="drawer-close-btn" onClick={onClose}>
              ✕
            </button>
          ) : (
            <button className="drawer-close-btn" onClick={handleBack}>
              ←
            </button>
          )}

          <div className="drawer-user-info">
            {currentView === "menu" ? (
              <>
                <div className="drawer-avatar">
                  {displayedName.charAt(0).toUpperCase()}
                </div>
                <div className="drawer-greeting">
                  <span className="greeting-label">Signed in as</span>
                  <span className="username-text">{displayedName}</span>
                </div>
              </>
            ) : (
              <div className="drawer-greeting">
                <span className="username-text">
                  {currentView === "liked" ? "Liked Films" : "Disliked Films"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="drawer-body" style={{ overflowY: "auto" }}>
          {currentView === "menu" && (
            <>
              <div className="nav-item active">Home</div>
              <div className="nav-item">Profile</div>
              <div className="nav-item">Settings</div>
              <hr style={{ opacity: 0.1, margin: "10px 0" }} />
              <div
                className="nav-item"
                onClick={() => setCurrentView("liked")}
              >
                Liked Films
              </div>
              <div
                className="nav-item"
                onClick={() => setCurrentView("disliked")}
              >
                Disliked Films
              </div>
            </>
          )}

          {(currentView === "liked" || currentView === "disliked") && (
            <div style={{ padding: "10px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
                  Loading...
                </div>
              ) : films.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
                  No films found.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  {films.map((film) => (
                    <div
                      key={film.id}
                      onClick={() => setSelectedFilm(film)}
                      style={{ cursor: "pointer", position: "relative" }}
                    >
                      {renderPoster(film.posterPath) ? (
                        <img
                          src={renderPoster(film.posterPath)}
                          alt={film.title}
                          style={{
                            width: "100%",
                            aspectRatio: "2/3",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "2/3",
                            backgroundColor: "#333",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            color: "#777",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {currentView === "menu" && (
          <div className="drawer-footer">
            <button className="logout-btn" onClick={onLogout}>
              <img src="/logout-icon.svg" alt="" className="btn-icon" />
              <span>Log Out</span>
            </button>
            <div className="app-version">Kino v1.0</div>
          </div>
        )}
      </div>

      {/* Modal for Film Details - No Actions */}
      {selectedFilm && (
        <FilmDetailModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          showActions={false}
        />
      )}
    </>
  );
}