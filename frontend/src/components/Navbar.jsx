
import NotificationBell from "./NotificationBell";

function Navbar({
  search,
  setSearch,
  menuOpen,
  setMenuOpen,
  user,
  onLogin,
  onLogout,
  onBookingHistory,
}) {
  return (
    <header className="navbar">
      <a className="logo" href="#home" aria-label="iMovies home">
        <span className="logo-mark">▶</span>
        <span>iMovies</span>
      </a>

      <button
        className="mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
        <a
          className="active"
          href="#home"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </a>

        <a href="#movies" onClick={() => setMenuOpen(false)}>
          Movies
        </a>

        <a href="#genres" onClick={() => setMenuOpen(false)}>
          Genres
        </a>

        <a href="#footer" onClick={() => setMenuOpen(false)}>
          About
        </a>
      </nav>

      <div className="nav-search">
        <span aria-hidden="true">⌕</span>

        <input
          type="search"
          placeholder="Search movies..."
          aria-label="Search movies"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {user ? (
        <div className="nav-user">
          <span className="nav-user-name">
            <span className="welcome-text">WELCOME BACK</span>
            <span className="username">{user.name}</span>
          </span>

          <NotificationBell />

          <button
            className="login-btn"
            onClick={() => {
              setMenuOpen(false);
              onBookingHistory();
            }}
          >
            My Bookings
          </button>

          <button className="login-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <button
          className="login-btn"
          onClick={() => {
            setMenuOpen(false);
            onLogin();
          }}
        >
          Login
        </button>
      )}
    </header>
  );
}

export default Navbar;
