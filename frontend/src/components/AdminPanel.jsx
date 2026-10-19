

import { useEffect, useState } from "react";
import "./AdminPanel.css";

const API = "http://localhost:5000/api";

const empty = {
  title: "",
  genre: "",
  rating: 0,
  duration: 0,
  language: "English",
  ticketPrice: 200,
  poster: "",
  description: "",
};

export default function AdminPanel({ user, onBack, onLogout }) {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const token = localStorage.getItem("imoviesToken");

  async function api(path = "/movies", options = {}) {
    const res = await fetch(API + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body && { "Content-Type": "application/json" }),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function load() {
    try {
      setMovies((await api()).movies || []);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function syncMovies() {
  setSyncing(true);
  setError("");
  setMessage("");

  try {
    const data = await api("/tmdb/sync");
    setMessage(
      `TMDB returned ${data.results?.length || 0} movies.`
    );
    await load();
  } catch (e) {
    setError(e.message);
  } finally {
    setSyncing(false);
  }
}

  function start(movie = null) {
    setEditing(movie?._id || null);
    setForm(movie
      ? { ...empty, ...movie, genre: movie.genre?.join(", ") || "" }
      : { ...empty });
    setError("");
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();

    try {
      const data = { ...form,
        genre: form.genre.split(",").map(g => g.trim()).filter(Boolean),
        rating: Number(form.rating),
        duration: Number(form.duration),
        ticketPrice: Number(form.ticketPrice),
      };

      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;

      await api(editing ? `/movies/${editing}` : "/movies", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(data),
      });

      setOpen(false);
      setMessage(editing ? "Movie updated." : "Movie added.");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(movie) {
    if (!window.confirm(`Delete ${movie.title}?`)) return;

    try {
      await api(`/movies/${movie._id}`, { method: "DELETE" });
      setMovies(old => old.filter(m => m._id !== movie._id));
      setMessage("Movie deleted.");
    } catch (e) {
      setError(e.message);
    }
  }

  if (user?.role !== "admin") {
    return <main className="admin-page"><h2>Admin access required</h2><button onClick={onBack}>Back</button></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">IMOVIES MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-secondary-btn" onClick={onBack}>View Website</button>
          <button className="admin-secondary-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total Movies</span><strong>{movies.length}</strong>
        </article>
      </section>

      <section className="admin-movies-section">
        <div className="admin-section-heading">
          <div><h2>Manage Movies</h2><p>Add, edit, delete or sync movies</p></div>
          <div className="admin-header-actions">
            <button className="admin-secondary-btn" disabled={syncing} onClick={syncMovies}>
              {syncing ? "Syncing..." : "Sync TMDB"}
            </button>
            <button className="admin-add-btn" onClick={() => start()}>+ Add Movie</button>
          </div>
        </div>

        {message && <p className="admin-success">{message}</p>}
        {error && !open && <p className="admin-error">{error}</p>}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Movie</th><th>Genre</th><th>Rating</th><th>Duration</th><th>Language</th><th>Actions</th></tr></thead>
            <tbody>
              {movies.map(m => (
                <tr key={m._id}>
                  <td><div className="admin-movie-cell">{m.poster && <img src={m.poster} alt={m.title} />}<strong>{m.title}</strong></div></td>
                  <td>{m.genre?.join(", ") || "—"}</td>
                  <td>{m.rating}/10</td>
                  <td>{m.duration ? `${m.duration} min` : "N/A"}</td>
                  <td>{m.language}</td>
                  <td><button onClick={() => start(m)}>Edit</button>{" "}<button onClick={() => remove(m)}>Delete</button></td>
                </tr>
              ))}
              {!movies.length && <tr><td colSpan="6">No movies found. Try syncing TMDB.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="movie-modal-backdrop" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <form className="movie-modal" onSubmit={save}>
            <h2>{editing ? "Edit Movie" : "Add Movie"}</h2>
            {error && <p className="admin-error">{error}</p>}

            {Object.entries(empty).map(([name]) => (
              <label key={name}>
                {name === "genre" ? "Genres (comma separated)" : name.charAt(0).toUpperCase() + name.slice(1)}
                {name === "description" ? (
                  <textarea value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} />
                ) : (
                  <input
                    required={name === "title"}
                    type={["rating", "duration", "ticketPrice"].includes(name) ? "number" : "text"}
                    value={form[name] ?? ""}
                    onChange={e => setForm({ ...form, [name]: e.target.value })}
                  />
                )}
              </label>
            ))}

            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit">{editing ? "Save Changes" : "Add Movie"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
