
const mongoose = require("mongoose");

const holdSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    showKey: { type: String, required: true },
    movieTitle: { type: String, required: true },
    theatre: { type: String, required: true },
    showDate: { type: String, required: true },
    showTime: { type: String, required: true },
    seats: { type: [String], required: true },
    amount: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ["active", "confirmed", "released", "expired"],
      default: "active",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", null],
      default: null,
    },
    transactionId: { type: String, default: null },
    paymentCompletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hold", holdSchema);
