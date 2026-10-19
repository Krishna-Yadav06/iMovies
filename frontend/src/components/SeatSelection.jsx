
import { useMemo } from "react";
import "./SeatSelection.css";

const rows = ["A", "B", "C", "D", "E", "F"];
const seatsPerRow = 10;

function SeatSelection({
  seats,
  selectedSeats,
  onToggleSeat,
  price,
  onContinue,
  onBack,
  loading,
  error,
}) {
  const total = useMemo(
    () => selectedSeats.length * price,
    [selectedSeats, price]
  );

  const seatMap = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      map.set(seat.seatNumber, seat);
    });

    return map;
  }, [seats]);

  function getSeatStatus(seatNumber) {
    const seat = seatMap.get(seatNumber);

    if (!seat) return "available";

    if (seat.status === "booked") return "booked";

    if (seat.status === "held") return "held";

    return "available";
  }

  return (
    <div className="seat-selection">
      <div className="seat-heading">
        <div>
          <p className="booking-eyebrow">STEP 2 OF 3</p>
          <h2>Select your seats</h2>
          <p className="seat-subtitle">
            Choose up to 10 seats for your show.
          </p>
        </div>

        <div className="seat-count">
          {selectedSeats.length}/10
          <span> selected</span>
        </div>
      </div>

      <div className="screen-area">
        <div className="screen-glow" />
        <div className="screen-shape" />
        <span>SCREEN THIS WAY</span>
      </div>

      <div className="seat-map" aria-label="Cinema seat map">
        {rows.map((row) => (
          <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>

            <div className="seat-row-group">
              {Array.from({ length: seatsPerRow }, (_, index) => {
                const seatNumber = `${row}${index + 1}`;
                const status = getSeatStatus(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);
                const isUnavailable = status !== "available";

                return (
                  <button
                    key={seatNumber}
                    type="button"
                    className={[
                      "cinema-seat",
                      isSelected ? "selected" : "",
                      status === "booked" ? "booked" : "",
                      status === "held" ? "held" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onToggleSeat(seatNumber)}
                    disabled={
                      isUnavailable ||
                      loading ||
                      (!isSelected && selectedSeats.length >= 10)
                    }
                    aria-label={`Seat ${seatNumber}${
                      isSelected ? ", selected" : ""
                    }`}
                    aria-pressed={isSelected}
                    title={`${seatNumber} - ${
                      isSelected ? "Selected" : status
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <span className="row-label">{row}</span>
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <span>
          <i className="legend-seat available-legend" />
          Available
        </span>
        <span>
          <i className="legend-seat selected-legend" />
          Selected
        </span>
        <span>
          <i className="legend-seat booked-legend" />
          Booked
        </span>
        <span>
          <i className="legend-seat held-legend" />
          Temporarily held
        </span>
      </div>

      {error && <p className="seat-error">{error}</p>}

      <div className="selected-seat-details">
        <div>
          <p className="selected-label">YOUR SEATS</p>
          <p className="selected-seat-numbers">
            {selectedSeats.length
              ? selectedSeats.join(", ")
              : "No seats selected yet"}
          </p>
        </div>

        <div className="seat-total">
          <span>Total amount</span>
          <strong>₹{total.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="seat-actions">
        <button
          type="button"
          className="booking-secondary-button"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </button>

        <button
          type="button"
          className="booking-primary-button"
          onClick={onContinue}
          disabled={selectedSeats.length === 0 || loading}
        >
          {loading ? "Holding seats..." : "Continue to checkout"}
        </button>
      </div>

      {selectedSeats.length >= 10 && (
        <p className="seat-limit-note">
          You have reached the maximum of 10 seats per booking.
        </p>
      )}
    </div>
  );
}

export default SeatSelection;
