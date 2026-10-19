
import { useCallback, useEffect, useMemo, useState } from "react";
import SeatSelection from "./SeatSelection";
import ShowSelection from "./ShowSelection";
import BookingCheckout from "./BookingCheckout";
import PaymentD from "./PaymentD";
import "./BookingModal.css";

const API = "https://imovies-9zv6.onrender.com/api";
const theatres = ["PVR", "INOX", "Cinepolis"];
const showTimes = ["10:00 AM", "1:30 PM", "4:45 PM", "8:00 PM"];

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getPoster = (movie) =>
  movie?.imageUrl || movie?.poster || movie?.image || "";

function BookingModal({ movie, onClose }) {
  const [stage, setStage] = useState("show");
  const [theatre, setTheatre] = useState(theatres[0]);
  const [showDate, setShowDate] = useState(getToday());
  const [showTime, setShowTime] = useState(showTimes[0]);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdToken, setHoldToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [amount, setAmount] = useState(0);
  const [pricePerSeat, setPricePerSeat] = useState(
    Number(movie?.ticketPrice ?? movie?.price) || 200
  );
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [loadingHold, setLoadingHold] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [emailSent, setEmailSent] = useState(null);
  

  const price = Number(movie?.ticketPrice ?? movie?.price) || 200;
  const poster = getPoster(movie);
  const genres = Array.isArray(movie?.genre)
    ? movie.genre.join(" · ")
    : movie?.genre || movie?.genres?.join?.(" · ") || "";

  const showKey = useMemo(
  () =>
    [
      theatre,
      movie?._id ?? movie?.id ?? movie?.title ?? "movie",
      showDate,
      showTime,
    ]
      .map((v) => String(v).trim().replace(/[^a-zA-Z0-9_-]/g, "_"))
      .join("|"),
  [movie?._id, movie?.id, movie?.title, theatre, showDate, showTime]
);

  const loadSeats = useCallback(async () => {
    setLoadingSeats(true);
    setError("");
    setSeats([]);
    setSelectedSeats([]);

    try {
      const res = await fetch(`${API}/seats/${encodeURIComponent(showKey)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load seats.");

      const available = Array.isArray(data) ? data : data.seats || [];
      setSeats(available);
      setSelectedSeats(
        ["C4", "C5", "C6"].filter((n) =>
          available.some((s) => s.seatNumber === n && s.status === "available")
        )
      );
      setStage("seats");
    } catch (err) {
      setError(err.message || "Could not load seats.");
    } finally {
      setLoadingSeats(false);
    }
  }, [showKey]);

  const releaseHold = useCallback(async (token) => {
    if (!token) return;

    const authToken = localStorage.getItem("imoviesToken");

    try {
      await fetch(`${API}/holds/${encodeURIComponent(token)}`, {
        method: "DELETE",
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {},
      });
    } catch {}
  }, []);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!holdToken || !["checkout", "payment"].includes(stage)) return;

    const timer = window.setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000
    );

    return () => window.clearInterval(timer);
  }, [holdToken, stage]);

  useEffect(() => {
    if (
      !holdToken ||
      secondsLeft > 0 ||
      !["checkout", "payment"].includes(stage)
    )
      return;

    setError("Your seat hold has expired. Please select seats again.");
    setHoldToken("");
    setSelectedSeats([]);
    setStage("seats");
    loadSeats();
  }, [holdToken, secondsLeft, stage, loadSeats]);

  useEffect(() => {
    if (!holdToken) return;
    return () => releaseHold(holdToken);
  }, [holdToken, releaseHold]);

  function toggleSeat(number) {
    setError("");
    setSelectedSeats((prev) => {
      if (prev.includes(number)) return prev.filter((s) => s !== number);

      if (prev.length >= 10) {
        setError("You can select a maximum of 10 seats.");
        return prev;
      }

      return [...prev, number];
    });
  }

  async function createHold() {
    if (!selectedSeats.length || selectedSeats.length > 10) {
      setError("Select between 1 and 10 seats.");
      return;
    }

    setLoadingHold(true);
    setError("");

    try {
      const token = localStorage.getItem("imoviesToken");
      const res = await fetch(`${API}/holds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          showKey,
          movieTitle: movie?.title,
          theatre,
          showDate,
          showTime,
          seats: selectedSeats,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not hold seats.");

      setHoldToken(data.token || data.holdToken || "");
      setBookingId(data.bookingId || "");
      setPricePerSeat(Number(data.pricePerSeat) || price);
      setAmount(Number(data.amount) || 0);
      setTransactionId("");
      setEmailSent(null);
      setSecondsLeft(
        data.expiresAt
          ? Math.max(0, Math.ceil((new Date(data.expiresAt) - Date.now()) / 1000))
          : 300
      );
      setStage("checkout");
    } catch (err) {
      setError(err.message || "Could not hold seats.");
      await loadSeats();
    } finally {
      setLoadingHold(false);
    }
  }

  async function cancelBooking() {
    await releaseHold(holdToken);
    setHoldToken("");
    setSelectedSeats([]);
    setError("");
    setStage("show");
  }

  async function confirmPayment(method) {
    if (!holdToken || secondsLeft <= 0) {
      setError("Your seat hold has expired. Please select seats again.");
      setStage("seats");
      return;
    }

    if (paying) return;

    setPaying(true);
    setError("");
    setPaymentStatus("Processing your demo payment...");

    const slowTimer = window.setTimeout(() => {
      setPaymentStatus(
        "This is taking longer than usual. Please keep this window open..."
      );
    }, 20000);

    try {
      const token = localStorage.getItem("imoviesToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const paymentRes = await fetch(
        `${API}/holds/${encodeURIComponent(holdToken)}/demo-payment`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ outcome: "success", method }),
        }
      );

      const payment = await paymentRes.json();
      if (!paymentRes.ok || payment.success !== true) {
        throw new Error(payment.message || "Payment failed.");
      }

      setTransactionId(payment.transactionId || "");
      setPaymentStatus("Payment processed. Confirming your booking...");

      const confirmRes = await fetch(
        `${API}/holds/${encodeURIComponent(holdToken)}/confirm`,
        { method: "POST", headers }
      );

      const data = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(data.message || "Booking confirmation failed.");
      }

      setBookingId(data.bookingId || bookingId);
      setEmailSent(data.emailSent === true);
      setHoldToken("");
      setStage("success");
      window.dispatchEvent(new Event("imovies-notifications-update"));
    } catch (err) {
      setError(err.message || "Could not complete demo payment.");
    } finally {
      window.clearTimeout(slowTimer);
      setPaying(false);
      setPaymentStatus("");
    }
  }

  return (
    <div
      className="booking-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Book tickets for ${movie?.title || "movie"}`}
    >
      <div className="booking-page">
        <header className="booking-topbar">
          <button className="booking-brand" onClick={() => setStage("show")}>
            <span className="booking-brand-mark">i</span> iMovies
          </button>
          <button className="booking-close" onClick={onClose}>✕</button>
        </header>

        <main className="booking-content">
          {stage === "show" && (
            <ShowSelection
              movie={movie}
              theatre={theatre}
              setTheatre={setTheatre}
              showDate={showDate}
              setShowDate={setShowDate}
              showTime={showTime}
              setShowTime={setShowTime}
              theatres={theatres}
              showTimes={showTimes}
              genres={genres}
              price={price}
              error={error}
              loadingSeats={loadingSeats}
              loadSeats={loadSeats}
              onClose={onClose}
            />
          )}

          {stage === "seats" && (
            <>
              <div className="booking-context-strip">
                <div>
                  <strong>{movie?.title}</strong>
                  <span>{theatre} · {showDate} · {showTime}</span>
                </div>
                <button
                  className="booking-edit-button"
                  onClick={() => setStage("show")}
                >
                  Edit show
                </button>
              </div>

              <SeatSelection
                seats={seats}
                selectedSeats={selectedSeats}
                onToggleSeat={toggleSeat}
                price={pricePerSeat}
                onContinue={createHold}
                onBack={() => setStage("show")}
                loading={loadingHold}
                error={error}
              />
            </>
          )}

          {stage === "checkout" && (
            <BookingCheckout
              movie={movie}
              poster={poster}
              theatre={theatre}
              showDate={showDate}
              showTime={showTime}
              selectedSeats={selectedSeats}
              pricePerSeat={pricePerSeat}
              amount={amount}
              secondsLeft={secondsLeft}
              error={error}
              paying={paying}
              onCancel={cancelBooking}
              onConfirm={() => {
                setError("");
                setStage("payment");
              }}
            />
          )}

          {stage === "payment" && (
            <>
              {error && <p className="booking-error">{error}</p>}
              <PaymentD
                amount={amount}
                loading={paying}
                statusMessage={paymentStatus}
                onCancel={() => {
                  setError("");
                  setStage("checkout");
                }}
                onSuccess={confirmPayment}
              />
            </>
          )}

          {stage === "success" && (
            <section className="booking-success">
              <div className="booking-success-icon">✓</div>
              <p className="booking-eyebrow">BOOKING CONFIRMED</p>
              <h1>Your movie ticket is ready!</h1>
              <p className="booking-success-copy">
                Your seats are confirmed. Keep your booking reference handy.
              </p>

              {emailSent === true && (
                <p className="booking-success-copy">
                  A confirmation email has been sent to your registered email address.
                </p>
              )}

              {emailSent === false && (
                <p className="booking-success-copy">
                  Your booking is confirmed, but we couldn't send the email.
                  Please check your registered email settings or contact support.
                </p>
              )}

              <div className="movie-ticket">
                <div className="movie-ticket-header">
                  <div>
                    <span className="movie-ticket-brand">iMOVIES</span>
                    <p className="movie-ticket-label">V</p>
                  </div>
                  <span className="movie-ticket-status">CONFIRMED</span>
                </div>

                <div className="movie-ticket-movie">
                  <div className="movie-ticket-poster">
                    {poster ? <img src={poster} alt={movie?.title} /> : "iM"}
                  </div>
                  <div className="movie-ticket-title">
                    <span>NOW SHOWING</span>
                    <h2>{movie?.title || "Movie"}</h2>
                    <p>{genres || "Movie experience"}</p>
                  </div>
                </div>

                <div className="movie-ticket-details">
                  <div><span>THEATRE</span><strong>{theatre}</strong></div>
                  <div><span>DATE</span><strong>{showDate}</strong></div>
                  <div><span>SHOW TIME</span><strong>{showTime}</strong></div>
                  <div><span>SEATS</span><strong>{selectedSeats.join(", ")}</strong></div>
                </div>

                <div className="movie-ticket-total">
                  <div>
                    <span>TOTAL AMOUNT</span>
                    <strong>₹{amount.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="movie-ticket-seat-count">
                    {selectedSeats.length} {selectedSeats.length === 1 ? "TICKET" : "TICKETS"}
                  </div>
                </div>

                <div className="movie-ticket-reference">
                  <span>BOOKING ID</span>
                  <strong>{bookingId || "Unavailable"}</strong>
                </div>

                <div className="movie-ticket-reference">
                  <span>PAYMENT REFERENCE</span>
                  <strong>{transactionId || "Unavailable"}</strong>
                </div>
              </div>

              <p className="booking-success-copy">
                No real money was charged.
              </p>

              <div className="movie-ticket-actions">
                <button
                  className="booking-secondary-button"
                  onClick={() => window.print()}
                >
                  Print ticket
                </button>
                <button className="booking-primary-button" onClick={onClose}>
                  Back to movies →
                </button>
              </div>
            </section>
          )}
        </main>

        <footer className="booking-footer">
          <span>iMovies</span>
          <span>Made for your next movie night.</span>
        </footer>
      </div>
    </div>
  );
}

export default BookingModal;
