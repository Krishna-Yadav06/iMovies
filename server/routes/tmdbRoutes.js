
const express = require("express");
const router = express.Router();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch(path, params = {}) {
  const token = process.env.TMDB_TOKEN;

  if (!token) {
    throw new Error("TMDB_TOKEN is missing from backend .env");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status}`);
  }

  return response.json();
}

function filterMovies(data) {
  return {
    ...data,
    results: (data.results || []).filter(
      (movie) => movie.adult !== true && movie.poster_path
    ),
  };
}

function sendError(res, error) {
  console.error("TMDB request failed:", error.message);

  res.status(502).json({
    message: "Unable to fetch movies from TMDB.",
  });
}

const indianMovieParams = {
  include_adult: false,
  include_video: false,
  with_origin_country: "IN",
};

async function discoverMovies(params = {}) {
  const data = await tmdbFetch("/discover/movie", {
    ...indianMovieParams,
    language: "en-US",
    sort_by: "popularity.desc",
    page: 1,
    ...params,
  });

  return filterMovies(data);
}

router.get("/popular", async (req, res) => {
  try {
    res.json(
      await discoverMovies({
        page: req.query.page || 1,
      })
    );
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/trending", async (req, res) => {
  try {
    const data = await discoverMovies({
      sort_by: "popularity.desc",
      page: req.query.page || 1,
    });

    res.json(data);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/top-rated", async (req, res) => {
  try {
    res.json(
      await discoverMovies({
        sort_by: "vote_average.desc",
        "vote_count.gte": 50,
        page: req.query.page || 1,
      })
    );
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    res.json(
      await discoverMovies({
        sort_by: "popularity.desc",
        "primary_release_date.gte": today,
        region: "IN",
        with_release_type: "2|3",
        page: req.query.page || 1,
      })
    );
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/now-playing", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    res.json(
      await discoverMovies({
        sort_by: "popularity.desc",
        "primary_release_date.lte": today,
        region: "IN",
        with_release_type: "2|3",
        page: req.query.page || 1,
      })
    );
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(400).json({
        message: "A search query is required.",
      });
    }

    const data = await tmdbFetch("/search/movie", {
      query,
      include_adult: false,
      language: "en-US",
      page: req.query.page || 1,
    });

    res.json(filterMovies(data));
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/sync", async (req, res) => {
  try {
    res.json(
      await discoverMovies({
        page: req.query.page || 1,
      })
    );
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
