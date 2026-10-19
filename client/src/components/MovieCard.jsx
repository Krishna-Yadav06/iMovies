
import { imageUrl } from "../data";

function MovieCard({ movie, isSaved, onToggleWatchlist, onBook }) {
  const posterUrl = movie.image?.startsWith("http")
    ? movie.image
    : imageUrl(movie.image);

  const isComingSoon = movie.price == null;

  return (
    <article className="movie-card">
      <div className="poster">
        <img
          src={posterUrl}
          alt={`${movie.title} poster`}
          loading="lazy"
        />

        <span className="rating">★ {movie.rating}</span>

        <button
          className={`watchlist-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onToggleWatchlist(movie.id)}
          aria-label={
            isSaved
              ? `Remove ${movie.title} from watchlist`
              : `Add ${movie.title} to watchlist`
          }
          aria-pressed={isSaved}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="movie-info">
        <h3>{movie.title}</h3>

        <div className="movie-genres">
          {movie.genre.map((genre) => (
            <span key={genre}>{genre}</span>
          ))}
        </div>

        <p className="duration">
          <span>◷</span> {movie.duration}
        </p>

        <div className="movie-bottom">
          {isComingSoon ? (
            <span className="release-status">
              RELEASING SOON
            </span>
          ) : (
            <>
              <span className="price">₹{movie.price}</span>

              <button
                className="book-btn"
                onClick={() => onBook(movie)}
              >
                Book now <span>→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
