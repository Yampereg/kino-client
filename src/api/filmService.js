// src/api/filmService.js
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const res = await fetch(`${apiBaseUrl}${url}`, { ...options, headers });

  if (res.status === 401) {
    // token expired or invalid → remove and redirect to login
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("unauthenticated");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  // parse JSON only if content exists
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

// Exported functions using the wrapper
export function fetchRecommendations() {
  return apiFetch("/api/films/recommendations");
}

export function fetchNextFilms() {
  return apiFetch("/api/films/next");
}

export function sendInteraction(filmId, type) {
  return apiFetch(`/api/interaction/${type}/${filmId}`, { method: "POST" });
}
