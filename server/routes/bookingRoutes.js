
const express = require("express");
const Hold = require("../models/Hold");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const bookings = await Hold.find({
      user: req.user.userId,
      status: "confirmed",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch booking history",
    });
  }
});

module.exports = router;
