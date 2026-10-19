
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

function MovieSection({
  search,
  activeGenre,
  setActiveGenre,
  watchlist,
  onToggleWatchlist,
  onBook,
  onClearFilters,
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    let cancelled = false;

    async function fetchMovies() {
      try {
        setLoading(true);
        setError("");

        const results = await getMovies();

        const formattedMovies = results.map((movie) => ({
          id: movie.id,
          title: movie.title,
          genre: (movie.genre_ids || []).map(
            (id) => genreNames[id] || "Other"
          ),
          rating: Number(movie.vote_average || 0).toFixed(1),
          duration: movie.release_date
            ? `Released ${movie.release_date.slice(0, 4)}`
            : "Runtime unavailable",
          price: getMoviePrice(movie),
          image: getPoster(movie.poster_path),
          description: movie.overview || "",
          releaseDate: movie.release_date || "",
          popularity: movie.popularity,
          voteAverage: movie.vote_average,
        }));

        if (!cancelled) {
          setMovies(formattedMovies);
          setVisibleCount(5);
        }
      } catch (err) {
        console.error("TMDB error:", err);

        if (!cancelled) {
          setError(err.message || "Unable to load movies.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMovies();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(5);
  }, [search, activeGenre]);

  const availableGenres = [
    "All",
    ...new Set(movies.flatMap((movie) => movie.genre)),
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    const matchesGenre =
      activeGenre === "All" || movie.genre.includes(activeGenre);

    return matchesSearch && matchesGenre;
  });

  const visibleMovies = filteredMovies.slice(0, visibleCount);

  return (
    <section className="movies-section" id="movies">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIND SOMETHING TO WATCH</span>
          <h2>Popular Movies & Search Results</h2>
        </div>

        <span className="movie-count">
          {loading
            ? "Loading..."
            : `${filteredMovies.length} ${
                filteredMovies.length === 1 ? "movie" : "movies"
              }`}
        </span>
      </div>

      {!loading && !error && (
        <div className="genre-list" id="genres">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${
                activeGenre === genre ? "selected" : ""
              }`}
              onClick={() => setActiveGenre(genre)}
              aria-pressed={activeGenre === genre}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <h3>Loading movies...</h3>
          <p>Fetching popular movies from TMDB.</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>Couldn't load movies</h3>
          <p>{error}</p>
          <button
            className="outline-btn"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : filteredMovies.length > 0 ? (
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

          {visibleCount < filteredMovies.length && (
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
          <h3>No movies found</h3>
          <p>Try another title or select a different genre.</p>
          <button className="outline-btn" onClick={onClearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

export default MovieSection;
