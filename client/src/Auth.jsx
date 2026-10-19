import { useState } from "react";
import "./Auth.css";

const API_URL = "https://imovies-9zv6.onrender.com/api/auth";

export default function Auth({ onBack, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isRegister = mode === "register";

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && !form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("Password must contain 8–72 characters.");
      return;
    }

    if (isRegister && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isRegister && { name: form.name.trim() }),
            email: form.email.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem("imoviesToken", data.token);
      localStorage.setItem("imoviesUser", JSON.stringify(data.user));

      onSuccess(data.user);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <button className="auth-back" onClick={onBack} type="button">
          <span>←</span> Back to iMovies
        </button>

        <a href="#home" className="auth-brand" onClick={onBack}>
          <span className="auth-logo-mark">▶</span> iMovies
        </a>
      </div>

      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="auth-eyebrow">YOUR SEAT IS WAITING</span>

          <h1>
            Every great story
            <br />
            starts with a <span>ticket.</span>
          </h1>

          <p>
            Find the films you love, save your favourites, and make
            your next movie night memorable.
          </p>

          <div className="auth-benefits">
            <div>
              <span className="benefit-icon">✦</span>
              <span>
                <strong>Your favourites</strong>
                <small>Keep your watchlist close</small>
              </span>
            </div>

            <div>
              <span className="benefit-icon">▣</span>
              <span>
                <strong>Your movie nights</strong>
                <small>Plan your next cinema visit</small>
              </span>
            </div>
          </div>

          <div className="auth-decoration">
            <span>IMOVIES</span>
            <span />
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-eyebrow">
              {isRegister ? "JOIN THE EXPERIENCE" : "WELCOME BACK"}
            </span>

            <h2>{isRegister ? "Create account" : "Welcome back."}</h2>

            <p>
              {isRegister
                ? "Create your account and get started."
                : "Sign in to continue your movie journey."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={!isRegister ? "auth-tab active" : "auth-tab"}
              onClick={() => changeMode("login")}
              type="button"
            >
              Login
            </button>

            <button
              className={isRegister ? "auth-tab active" : "auth-tab"}
              onClick={() => changeMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={updateField}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>

              <div className="auth-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={updateField}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  minLength={8}
                  maxLength={72}
                  required
                />

                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {isRegister && (
              <label className="auth-field">
                <span>Confirm password</span>

                <div className="auth-password-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Enter your password again"
                    value={form.confirmPassword}
                    onChange={updateField}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            )}

            {!isRegister && (
              <div className="auth-options">
                <label className="auth-remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            {error && (
              <p className="auth-message" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister
              ? "Already have an account?"
              : "New to iMovies?"}{" "}
            <button
              type="button"
              onClick={() => changeMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>

          <p className="auth-terms">
            By continuing, you agree to the terms of this student project.
          </p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© 2026 iMovies</span>
        <span />
      </footer>
    </main>
  );
}