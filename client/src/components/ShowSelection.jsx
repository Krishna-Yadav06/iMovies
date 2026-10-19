
function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function getCurrentTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

const getMoviePoster = (movie) =>
  movie?.imageUrl || movie?.poster || movie?.image || "";

const getMovieDescription = (movie) =>
  movie?.description ||
  movie?.overview ||
  "Get ready for an unforgettable cinematic experience on the big screen.";

function ShowSelection({
  movie,
  theatre,
  setTheatre,
  showDate,
  setShowDate,
  showTime,
  setShowTime,
  theatres,
  showTimes,
  genres,
  price,
  error,
  loadingSeats,
  loadSeats,
  onClose,
}) {
  const poster = getMoviePoster(movie);
  const today = getToday();
  const currentTime = getCurrentTime();

  const isPastTime = (time) =>
    showDate === today && timeToMinutes(time) <= timeToMinutes(currentTime);

  function timeToMinutes(time) {
    const match = String(time).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

    if (!match) return -1;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3]?.toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const availableShowTimes = showTimes.filter((time) => !isPastTime(time));

  const selectedTimeIsPast = isPastTime(showTime);

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setShowDate(nextDate);

    if (nextDate === today && isPastTime(showTime)) {
      const nextAvailableTime = showTimes.find(
        (time) => !(
          timeToMinutes(time) <= timeToMinutes(currentTime)
        )
      );

      if (nextAvailableTime) {
        setShowTime(nextAvailableTime);
      }
    }
  }

  async function handleSelectSeats() {
    if (!showDate || showDate < today) {
      window.alert("Please select today or a future date.");
      return;
    }

    if (selectedTimeIsPast) {
      window.alert("This showtime has already passed. Please select a future showtime.");
      return;
    }

    await loadSeats();
  }

  return (
    <>
      <div className="booking-page-heading">
        <p className="booking-eyebrow">YOUR MOVIE NIGHT</p>
        <h1>Book your tickets</h1>
        <p>Choose a theatre and showtime to get started.</p>
      </div>

      <section className="booking-movie-card">
        <div className="booking-movie-poster">
          {poster ? (
            <img src={poster} alt={movie?.title || "Movie poster"} />
          ) : (
            <div className="booking-poster-fallback">
              {movie?.title || "iMovies"}
            </div>
          )}
        </div>

        <div className="booking-movie-info">
          <span className="booking-movie-tag">NOW BOOKING</span>
          <h2>{movie?.title || "Untitled movie"}</h2>

          {genres && <p className="booking-movie-meta">{genres}</p>}

          <p className="booking-movie-description">
            {getMovieDescription(movie)}
          </p>

          <div className="booking-movie-facts">
            {movie?.rating && <span>★ {movie.rating}</span>}
            {movie?.duration && <span>{movie.duration}</span>}
            <span>₹{price} / seat</span>
          </div>
        </div>
      </section>

      <section className="booking-show-form">
        <div className="booking-section-heading">
          <span>01</span>
          <div>
            <h3>Choose your show</h3>
            <p>Select the theatre, date and time.</p>
          </div>
        </div>

        <label className="booking-field-label">THEATRE</label>

        <div className="theatre-options">
          {theatres.map((name) => (
            <button
              type="button"
              key={name}
              className={`theatre-option ${theatre === name ? "active" : ""}`}
              onClick={() => setTheatre(name)}
            >
              <span className="theatre-option-icon">▣</span>
              <span>{name}</span>
              <small>
                {name === "PVR"
                  ? "Premium screens"
                  : name === "INOX"
                    ? "Big screen experience"
                    : "Movies your way"}
              </small>
            </button>
          ))}
        </div>

        <div className="booking-date-time-grid">
          <div className="booking-form-field">
            <label htmlFor="booking-date">SHOW DATE</label>
            <input
              id="booking-date"
              type="date"
              value={showDate}
              min={today}
              onChange={handleDateChange}
            />
          </div>

          <div className="booking-form-field">
            <label htmlFor="booking-time">SHOW TIME</label>
            <select
              id="booking-time"
              value={showTime}
              onChange={(event) => setShowTime(event.target.value)}
            >
              {showTimes.map((time) => (
                <option
                  key={time}
                  value={time}
                  disabled={isPastTime(time)}
                >
                  {time}
                  {isPastTime(time) ? " (Show Already Started)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="booking-error">{error}</p>}

        <div className="booking-bottom-actions">
          <button
            type="button"
            className="booking-secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="booking-primary-button"
            onClick={handleSelectSeats}
            disabled={
              loadingSeats ||
              !showDate ||
              showDate < today ||
              selectedTimeIsPast
            }
          >
            {loadingSeats ? "Loading seats..." : "Select seats"}
            {!loadingSeats && <span> →</span>}
          </button>
        </div>
      </section>
    </>
  );
}

export default ShowSelection;

