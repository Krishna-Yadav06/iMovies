const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("./models/Movie");

const movies = [
  {
    title: "Interstellar",
    description: "A journey beyond the stars to save humanity.",
    genre: ["Sci-Fi", "Drama"],
    rating: 8.7,
    duration: 169,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    language: "English",
  },
  {
    title: "The Batman",
    description: "A dark detective story set in Gotham City.",
    genre: ["Action", "Crime", "Drama"],
    rating: 7.8,
    duration: 176,
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    language: "English",
  },
  {
    title: "La La Land",
    description: "A musician and an actress pursue their dreams in Los Angeles.",
    genre: ["Romance", "Drama", "Musical"],
    rating: 8.0,
    duration: 128,
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    language: "English",
  },
  {
    title: "Joker",
    description: "A troubled man descends into chaos in Gotham City.",
    genre: ["Crime", "Drama", "Thriller"],
    rating: 8.4,
    duration: 122,
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    language: "English",
  },
];

async function seedMovies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Movie.deleteMany({});
    await Movie.insertMany(movies);

    console.log("Movies added successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();
