
const express = require("express");
const router = express.Router();
const Seat = require("../models/Seat");

const layouts = {
  PVR: { rows: 10, seats: 12 },
  INOX: { rows: 9, seats: 10 },
  Cinepolis: { rows: 12, seats: 12 },
};

router.get("/:showKey", async (req, res) => {
  try {
    const { showKey } = req.params;

    const theatre = showKey.split("|")[0];
    const layout = layouts[theatre] || layouts.PVR;

    let seats = await Seat.find({ showKey });

    const expectedSeats = layout.rows * layout.seats;

    if (seats.length > 0 && seats.length !== expectedSeats) {
      await Seat.deleteMany({ showKey });
      seats = [];
    }

    if (seats.length === 0) {
      const initialSeats = [];

      for (let row = 0; row < layout.rows; row++) {
        for (let number = 1; number <= layout.seats; number++) {
          initialSeats.push({
            showKey,
            seatNumber: `${String.fromCharCode(65 + row)}${number}`,
            status: "available",
          });
        }
      }

      await Seat.insertMany(initialSeats);
    }

    await Seat.updateMany(
      {
        showKey,
        status: "held",
        holdExpiresAt: { $ne: null, $lte: new Date() },
      },
      {
        $set: {
          status: "available",
          holdToken: null,
          holdExpiresAt: null,
        },
      }
    );

    seats = await Seat.find({ showKey });

    seats.sort((a, b) => {
      const rowA = a.seatNumber.match(/^[A-Z]+/)[0];
      const rowB = b.seatNumber.match(/^[A-Z]+/)[0];

      if (rowA !== rowB) return rowA.localeCompare(rowB);

      const numberA = Number(a.seatNumber.match(/\d+$/)[0]);
      const numberB = Number(b.seatNumber.match(/\d+$/)[0]);

      return numberA - numberB;
    });

    res.json({
      seats,
      layout: {
        theatre,
        rows: layout.rows,
        seatsPerRow: layout.seats,
        totalSeats: expectedSeats,
      },
    });
  } catch (error) {
    console.error("Seat loading error:", error);
    res.status(500).json({ message: "Failed to load seats" });
  }
});

module.exports = router;
