
const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    showKey: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "held", "booked"],
      default: "available",
    },
    holdToken: {
      type: String,
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

seatSchema.index(
  { showKey: 1, seatNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Seat", seatSchema);
