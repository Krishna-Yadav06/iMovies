
import { useState } from "react";
import "./PaymentD.css";

const methods = [
  { id: "upi", label: "UPI", icon: "▤", detail: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Cards", icon: "▣", detail: "Credit or debit card" },
  { id: "netbanking", label: "Net Banking", icon: "▥", detail: "Pay through your bank" },
];

function PaymentD({ amount, onSuccess, onCancel, loading, error }) {
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");

  function pay() {
    if (method === "upi" && !upiId.trim()) {
      return alert("Enter a demo UPI ID.");
    }

    if (method === "card" && (!cardNumber.trim() || !expiry.trim() || !cvv.trim())) {
      return alert("Fill in all demo card details.");
    }

    if (method === "netbanking" && !bank) {
      return alert("Select a bank.");
    }

    onSuccess(method);
  }

  return (
    <section className="payment-page">
      <header className="payment-header">
        <button className="payment-logo" onClick={onCancel}>
          <span>i</span> IMOVIES
        </button>
        <div className="payment-secure">⌑ CHECKOUT</div>
      </header>

      <div className="payment-steps">
        <span className="completed">✓ SHOW</span>
        <i />
        <span className="completed">✓ SEATS</span>
        <i />
        <span className="current">03 PAYMENT</span>
      </div>

      <div className="payment-layout">
        <main className="payment-main">
          <p className="payment-eyebrow">FINAL STEP</p>
          <h1>Complete your booking</h1>
          <p className="payment-subtitle">
            Choose your preferred payment method.
          </p>

          <h3 className="payment-section-title">Payment method</h3>

          <div className="payment-methods">
            {methods.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`payment-method ${method === item.id ? "selected" : ""}`}
                onClick={() => setMethod(item.id)}
                disabled={loading}
              >
                <span className="payment-method-icon">{item.icon}</span>
                <span className="payment-method-copy">
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
                <span className="payment-radio">
                  {method === item.id ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>

          <div className="payment-form">
            {method === "upi" && (
              <>
                <label htmlFor="upiId">UPI ID</label>
                <input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  disabled={loading}
                />
                <p className="payment-hint">
                  Enter any demo UPI ID to continue.
                </p>
              </>
            )}

            {method === "card" && (
              <>
                <label htmlFor="cardNumber">Card number</label>
                <input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  disabled={loading}
                />
                <div className="payment-card-fields">
                  <div>
                    <label htmlFor="expiry">Expiry date</label>
                    <input
                      id="expiry"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="payment-hint">
                  Use fictional details only. This is not a real card payment.
                </p>
              </>
            )}

            {method === "netbanking" && (
              <>
                <label htmlFor="bank">Select your bank</label>
                <select
                  id="bank"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choose a bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="other">Other bank</option>
                </select>
              </>
            )}
          </div>

          {error && <p className="payment-error">{error}</p>}

          <div className="payment-demo-note">
            <span>ⓘ</span>
            <p>
              <strong>Demo payment only</strong>
              <small>Disclaimer : No real payment will be processed or charged.</small>
            </p>
          </div>

          <button
            className="payment-submit"
            onClick={pay}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹${Number(amount).toLocaleString("en-IN")}`}
            {!loading && <span>→</span>}
          </button>

          <button
            className="payment-back"
            onClick={onCancel}
            disabled={loading}
          >
            ← Back to booking
          </button>
        </main>

        <aside className="payment-summary">
          <p className="payment-eyebrow">YOUR ORDER</p>
          <h2>Booking summary</h2>
          <div className="payment-summary-line">
            <span>Movie tickets</span>
            <strong>₹{Number(amount).toLocaleString("en-IN")}</strong>
          </div>
          <div className="payment-summary-line">
            <span>Payment method</span>
            <strong>{methods.find((m) => m.id === method)?.label}</strong>
          </div>
          <div className="payment-summary-total">
            <span>Total payable</span>
            <strong>₹{Number(amount).toLocaleString("en-IN")}</strong>
          </div>
          <p className="payment-summary-foot">
            <span>⌑</span> Thank You For Choosing iMovies.
          </p>
        </aside>
      </div>

      <footer className="payment-footer">
        <span>IMOVIES</span>
        <span>Made for your next movie night.</span>
      </footer>
    </section>
  );
}

export default PaymentD;
