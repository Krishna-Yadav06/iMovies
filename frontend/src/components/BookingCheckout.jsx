
function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookingCheckout({
  movie,
  poster,
  theatre,
  showDate,
  showTime,
  selectedSeats,
  pricePerSeat,
  amount,
  secondsLeft,
  error,
  paying,
  onCancel,
  onConfirm,
}) {
  return (
    <section className="booking-checkout">
      <p className="booking-eyebrow">STEP 3 OF 3</p>
      <h1>Review your booking</h1>
      <p className="booking-checkout-intro">
        Your selected seats are temporarily held while you complete checkout.
      </p>

      <div className="hold-countdown">
        <div>
          <span className="hold-countdown-label">TIME LEFT </span>
          <strong> {formatTime(secondsLeft)}</strong>
        </div>
        <span className="hold-countdown-note">
          Your seats will be released when the timer expires.
        </span>
      </div>

      <div className="checkout-summary">
        <div className="checkout-summary-heading">
          <div className="checkout-poster">
            {poster && <img src={poster} alt="" />}
          </div>
          <div>
            <h2>{movie?.title}</h2>
            <p>{theatre}</p>
            <p>{formatDate(showDate)} · {showTime}</p>
          </div>
        </div>

        <div className="checkout-summary-line">
          <span>Seats</span>
          <strong>{selectedSeats.join(", ")}</strong>
        </div>

        <div className="checkout-summary-line">
          <span>
            ₹{pricePerSeat} × {selectedSeats.length} seats
            </span>

            <strong>₹{Number(amount).toLocaleString("en-IN")}</strong>
         
        </div>

        <div className="checkout-summary-total">
          <span>Total payable</span>
          <strong>₹{Number(amount).toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="booking-demo-notice">
        <strong>Development checkout</strong>
        <p>
          This uses the project's test confirmation endpoint. It does not
          charge real money.
        </p>
      </div>

      {error && <p className="booking-error">{error}</p>}

      <div className="booking-bottom-actions">
        <button
          type="button"
          className="booking-secondary-button"
          onClick={onCancel}
          disabled={paying}
        >
          Cancel booking
        </button>

        <button
          type="button"
          className="booking-primary-button"
          onClick={onConfirm}
          disabled={paying || secondsLeft <= 0}
        >
          {paying ? "Opening..." : "Proceed to demo payment"}
        </button>
      </div>
    </section>
  );
}

export default BookingCheckout;
