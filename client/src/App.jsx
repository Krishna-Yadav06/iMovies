
import { useState } from "react";
import "./App.css";

import IntroAnimation from "./components/IntroAnimation";
import Auth from "./Auth";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieSection from "./components/MovieSection";
import TrendingMovies from "./components/TrendingMovies";
import TopRatedMovies from "./components/TopRatedMovies";
import UpcomingMovies from "./components/UpcomingMovies";
import NowPlayingMovies from "./components/NowPlayingMovies";
import BookingModal from "./components/BookingModal";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import BookingHistory from "./components/BookingHistory";

function App() {
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [watchlist, setWatchlist] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("imoviesUser")) || null;
    } catch {
      return null;
    }
  });

  function toggleWatchlist(id) {
    setWatchlist((current) =>
      current.includes(id)
        ? current.filter((movieId) => movieId !== id)
        : [...current, id]
    );
  }

  function bookMovie(movie) {
    setSelectedMovie(movie);
  }

  function closeBooking() {
    setSelectedMovie(null);
  }

  function exploreMovies() {
    document.getElementById("movies")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function clearFilters() {
    setSearch("");
    setActiveGenre("All");
  }

  function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);
    setShowAuth(false);
  }

  function handleLogout() {
    localStorage.removeItem("imoviesToken");
    localStorage.removeItem("imoviesUser");
    setUser(null);
    setShowAuth(false);
    setMenuOpen(false);
  }

  if (showHistory) {
    return (
      <BookingHistory
        user={user}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (showAdmin) {
    return (
      <AdminPanel
        user={user}
        onBack={() => setShowAdmin(false)}
        onLogout={handleLogout}
      />
    );
  }

  if (showAuth) {
    return (
      <Auth
        onBack={() => setShowAuth(false)}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  const movieSectionProps = {
    watchlist,
    onToggleWatchlist: toggleWatchlist,
    onBook: bookMovie,
  };

  return (
    <div className="app" id="home">
      {showIntro && (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      )}

      <Navbar
        search={search}
        setSearch={setSearch}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        user={user}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
        onBookingHistory={() => setShowHistory(true)}
      />

      {user?.role === "admin" && (
        <div className="admin-shortcut">
          <button
            className="admin-shortcut-btn"
            onClick={() => setShowAdmin(true)}
          >
            Open Admin Dashboard
          </button>
        </div>
      )}

      <main>
        <Hero onExplore={exploreMovies} />

        <MovieSection
          search={search}
          activeGenre={activeGenre}
          setActiveGenre={setActiveGenre}
          {...movieSectionProps}
          onClearFilters={clearFilters}
        />

        <TrendingMovies {...movieSectionProps} />

        <TopRatedMovies {...movieSectionProps} />

        <UpcomingMovies {...movieSectionProps} />

        <NowPlayingMovies {...movieSectionProps} />
      </main>

      <Footer />

      {selectedMovie && (
        <BookingModal
          movie={selectedMovie}
          onClose={closeBooking}
        />
      )}
    </div>
  );
}

export default App;
