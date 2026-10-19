
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
const testAuthRoutes = require("./routes/testAuthRoutes");
const seatRoutes = require("./routes/seatRoutes");
const holdRoutes = require("./routes/holdRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notifications");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://i-movies-tan.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.post("/api/holds/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route works",
  });
});

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test-auth", testAuthRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/holds", holdRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tmdb", require("./routes/tmdbRoutes"));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the IMovies API",
    status: "Running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IMovies backend is running",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`IMovies server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start IMovies server:", error.message);
    process.exit(1);
  }
}

startServer();
