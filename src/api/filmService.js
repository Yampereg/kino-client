const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

export async function fetchRecommendations(token) {
  const res = await fetch(`${apiBaseUrl}/api/films/recommendations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchNextFilms(token) {
  const res = await fetch(`${apiBaseUrl}/api/films/next`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch next swipe films');
  return res.json();
}

export async function sendInteraction(token, filmId, type) {
  const url = `${apiBaseUrl}/api/interaction/${type}/${filmId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to ${type} film ${filmId}`);
}
