
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    genre: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    poster: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: Date,
    },
    language: {
      type: String,
      default: "English",
    },
    ticketPrice: {
      type: Number,
      default: 200,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
