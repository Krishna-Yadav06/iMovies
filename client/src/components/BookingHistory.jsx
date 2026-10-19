
import { useEffect, useState } from "react";
import "./BookingHistory.css";

const API = "https://imovies-9zv6.onrender.com";

function BookingHistory({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("imoviesToken");

        const response = await fetch(`${API}/bookings/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load bookings");
        }

        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Could not load booking history");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <div className="booking-history">
      <header className="history-header">
        <button className="history-back" onClick={onBack}>
          ← Back to Movies
        </button>
        <span className="history-brand">iMovies</span>
      </header>

      <main className="history-content">
        <p className="history-label">YOUR MOVIE JOURNEY</p>
        <h1>My Bookings</h1>
        <p className="history-subtitle">
          Hi {user?.name || "Movie Lover"}, here's your booking history.
        </p>

        {loading ? (
          <p className="history-message">Loading your bookings...</p>
        ) : error ? (
          <p className="history-message">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="history-empty">
            <h2>No bookings yet</h2>
            <p>Your confirmed movie tickets will appear here.</p>
            <button onClick={onBack}>Explore Movies</button>
          </div>
        ) : (
          <div className="history-list">
            {bookings.map((booking) => (
              <article className="history-card" key={booking._id}>
                <div className="history-card-top">
                  <div>
                    <p className="history-label">MOVIE TICKET</p>
                    <h2>{booking.movieTitle}</h2>
                  </div>
                  <span className="history-status">Confirmed</span>
                </div>

                <div className="history-details">
                  <div>
                    <span>Theatre</span>
                    <strong>{booking.theatre}</strong>
                  </div>
                  <div>
                    <span>Date</span>
                    <strong>{booking.showDate}</strong>
                  </div>
                  <div>
                    <span>Show Time</span>
                    <strong>{booking.showTime}</strong>
                  </div>
                  <div>
                    <span>Seats</span>
                    <strong>{booking.seats?.join(", ") || "—"}</strong>
                  </div>
                </div>

                <div className="history-card-bottom">
                  <span>Booking ID: {booking._id}</span>
                  <strong>₹{booking.amount}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BookingHistory;
