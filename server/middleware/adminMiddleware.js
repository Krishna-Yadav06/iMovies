
const User = require("../models/User");

async function adminMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in.",
      });
    }

    const user = await User.findById(req.user.userId).select("role");

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify admin permissions.",
    });
  }
}

module.exports = adminMiddleware;
