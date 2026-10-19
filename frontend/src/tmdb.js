
const BASE = "http://localhost:5000/api/tmdb";

export async function getMovies(endpoint = "/popular") {
  const response = await fetch(`${BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function searchMovies(query) {
  return getMovies(`/search?query=${encodeURIComponent(query)}`);
}

export function getPoster(path) {
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : "";
}
