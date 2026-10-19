
import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { getMovies, getPoster } from "../tmdb";
import { getMoviePrice } from "../pricing";

const genreNames = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  35: "Comedy",
  53: "Thriller",
  878: "Sci-Fi",
  9648: "Mystery",
  10749: "Romance",
  14: "Fantasy",
  80: "Crime",
  99: "Documentary",
  10751: "Family",
  10752: "War",
  36: "History",
  10402: "Music",
  37: "Western",
  10770: "TV Movie",
};

function MovieRow({
  title,
  endpoint,
  watchlist,
  onToggleWatchlist,
  onBook,
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    let cancelled = false;

    async function fetchMovies() {
      setLoading(true);
      setError("");

      for (let retry = 0; retry < 3; retry++) {
        try {
          const results = await getMovies(endpoint);

          if (cancelled) return;

          const formattedMovies = results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            genre: (movie.genre_ids || []).map(
              (id) => genreNames[id] || "Other"
            ),
            rating: Number(movie.vote_average || 0).toFixed(1),
            duration:
            endpoint === "/upcoming"
                ? "To Be Announced Soon!"
                : movie.release_date
                ? `Released ${movie.release_date.slice(0, 4)}`
                : "Release date unavailable",

            price:
              endpoint === "/upcoming"
                ? null
                : getMoviePrice(movie),

            image: getPoster(movie.poster_path),
            description: movie.overview || "",
            releaseDate: movie.release_date || "",
            popularity: movie.popularity,
            voteAverage: movie.vote_average,
          }));

          setMovies(formattedMovies);
          setVisibleCount(5);
          setLoading(false);
          return;
        } catch (err) {
          if (cancelled) return;

          if (retry === 2) {
            setError(err.message || "Unable to load movies.");
            setLoading(false);
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, 700)
            );

            if (cancelled) return;
          }
        }
      }
    }

    fetchMovies();

    return () => {
      cancelled = true;
    };
  }, [endpoint, attempt]);

  const visibleMovies = movies.slice(0, visibleCount);

  return (
    <section className="movies-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            DISCOVER YOUR NEXT FILM
          </span>
          <h2>{title}</h2>
        </div>

        <span className="movie-count">
          {loading ? "Loading..." : `${movies.length} movies`}
        </span>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading movies...</h3>
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>Couldn't load {title.toLowerCase()}</h3>
          <p>{error}</p>

          <button
            className="outline-btn"
            onClick={() =>
              setAttempt((current) => current + 1)
            }
          >
            Try again
          </button>
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="movie-grid movie-row-grid">
            {visibleMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isSaved={watchlist.includes(movie.id)}
                onToggleWatchlist={onToggleWatchlist}
                onBook={onBook}
              />
            ))}
          </div>

          {visibleCount < movies.length && (
            <div className="load-more-container">
              <button
                className="outline-btn"
                onClick={() =>
                  setVisibleCount((count) => count + 5)
                }
              >
                Load More Movies
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No movies available</h3>
        </div>
      )}
    </section>
  );
}

export default MovieRow;

