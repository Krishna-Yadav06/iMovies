
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const router = express.Router();
const Seat = require("../models/Seat");
const Hold = require("../models/Hold");
const Movie = require("../models/Movie");
const Notification = require("../models/Notification");
const User = require("../models/User");

const {
  sendBookingConfirmationEmail,
} = require("../utils/emailService");

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        header.split(" ")[1],
        process.env.JWT_SECRET
      );
      req.user = { userId: decoded.userId };
    } catch {}
  }

  next();
}

function calculateTicketPrice(basePrice, showDate, showTime) {
  const day = new Date(`${showDate}T12:00:00`).getDay();

  return (
    basePrice +
    ([0, 6].includes(day) ? 30 : 0) +
    (showTime === "8:00 PM" ? 40 : 0)
  );
}

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { showKey, movieTitle, theatre, showDate, showTime, seats } =
      req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Please log in before booking." });
    }

    if (
      !showKey || !movieTitle || !theatre || !showDate || !showTime ||
      !Array.isArray(seats) || !seats.length || seats.length > 10 ||
      new Set(seats).size !== seats.length
    ) {
      return res.status(400).json({ message: "Invalid booking details." });
    }

    let movie = await Movie.findOne({ title: movieTitle });

    if (!movie) {
      movie = await Movie.create({ title: movieTitle, ticketPrice: 200 });
    }

    const basePrice = Number(movie.ticketPrice);

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return res.status(400).json({ message: "Invalid ticket price." });
    }

    const pricePerSeat = calculateTicketPrice(basePrice, showDate, showTime);
    const amount = pricePerSeat * seats.length;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const result = await Seat.updateMany(
      {
        showKey,
        seatNumber: { $in: seats },
        $or: [
          { status: "available" },
          { status: "held", holdExpiresAt: { $lte: new Date() } },
        ],
      },
      { $set: { status: "held", holdToken: token, holdExpiresAt: expiresAt } }
    );

    if (result.modifiedCount !== seats.length) {
      await Seat.updateMany(
        { showKey, holdToken: token },
        { $set: { status: "available", holdToken: null, holdExpiresAt: null } }
      );

      return res.status(409).json({
        message: "Some seats are unavailable. Please select again.",
      });
    }

    const hold = await Hold.create({
      token, showKey, movieTitle: movie.title, theatre,
      showDate, showTime, seats, amount, expiresAt,
      user: req.user.userId,
      status: "active",
    });

    res.status(201).json({
      token: hold.token,
      expiresAt: hold.expiresAt,
      amount,
      pricePerSeat,
      basePrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not hold seats." });
  }
});

router.post("/:token/demo-payment", optionalAuth, async (req, res) => {
  try {
    const { outcome, method } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Please log in." });
    }

    if (
      !["success", "failure"].includes(outcome) ||
      !["upi", "card", "netbanking"].includes(method)
    ) {
      return res.status(400).json({ message: "Invalid demo payment." });
    }

    const hold = await Hold.findOne({
      token: req.params.token,
      user: req.user.userId,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (!hold) {
      return res.status(404).json({ message: "Hold expired or not found." });
    }

    hold.paymentMethod = method;
    hold.paymentStatus = outcome === "success" ? "succeeded" : "failed";
    hold.transactionId = `DEMO-${crypto.randomUUID()}`;
    hold.paymentCompletedAt =
      outcome === "success" ? new Date() : null;

    await hold.save();

    res.json({
      success: outcome === "success",
      paymentStatus: hold.paymentStatus,
      transactionId: hold.transactionId,
      message: outcome === "success"
        ? "Demo payment successful."
        : "Demo payment failed. You can retry.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not process demo payment." });
  }
});

router.delete("/:token", optionalAuth, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Please log in." });
    }

    const hold = await Hold.findOne({
      token: req.params.token,
      user: req.user.userId,
      status: "active",
    });

    if (!hold) {
      return res.status(404).json({ message: "Hold not found." });
    }

    await Seat.updateMany(
      { showKey: hold.showKey, holdToken: hold.token, status: "held" },
      { $set: { status: "available", holdToken: null, holdExpiresAt: null } }
    );

    hold.status = "released";
    hold.paymentStatus = "cancelled";
    await hold.save();

    res.json({ message: "Seats released." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not release seats." });
  }
});

router.post("/:token/confirm", optionalAuth, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Please log in." });
    }

    const hold = await Hold.findOne({
      token: req.params.token,
      user: req.user.userId,
      status: "active",
      paymentStatus: "succeeded",
      expiresAt: { $gt: new Date() },
    });

    if (!hold) {
      return res.status(400).json({
        message: "Successful demo payment is required before confirmation.",
      });
    }

    const result = await Seat.updateMany(
      {
        showKey: hold.showKey,
        seatNumber: { $in: hold.seats },
        status: "held",
        holdToken: hold.token,
        holdExpiresAt: { $gt: new Date() },
      },
      {
        $set: { status: "booked", holdToken: null, holdExpiresAt: null },
      }
    );

    if (result.modifiedCount !== hold.seats.length) {
      return res.status(409).json({
        message: "Some seats are no longer available.",
      });
    }

    hold.status = "confirmed";
    await hold.save();

    let notificationCreated = true;
    try {
      await Notification.create({
        user: hold.user,
        title: "Booking Confirmed!",
        message: `Your booking for ${hold.movieTitle} at ${hold.theatre} on ${hold.showDate} at ${hold.showTime} is confirmed. Seats: ${hold.seats.join(", ")}. Total: ₹${hold.amount}.`,
        type: "booking",
      });
    } catch (error) {
      notificationCreated = false;
      console.error("Notification error:", error);
    }

    let emailSent = false;
    try {
      const user = await User.findById(hold.user).select("email");

      if (!user?.email) throw new Error("User email not found.");

      await sendBookingConfirmationEmail({
        to: user.email,
        movieTitle: hold.movieTitle,
        theatre: hold.theatre,
        showDate: hold.showDate,
        showTime: hold.showTime,
        seats: hold.seats,
        amount: hold.amount,
        bookingId: hold._id.toString(),
      });

      emailSent = true;
    } catch (error) {
      console.error("Email error:", error.message);
    }

    res.json({
      message: "Booking confirmed",
      bookingId: hold._id,
      movieTitle: hold.movieTitle,
      theatre: hold.theatre,
      showDate: hold.showDate,
      showTime: hold.showTime,
      seats: hold.seats,
      amount: hold.amount,
      transactionId: hold.transactionId,
      notificationCreated,
      emailSent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not confirm booking." });
  }
});

module.exports = router;

