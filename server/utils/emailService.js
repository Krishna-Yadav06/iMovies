
const nodemailer = require("nodemailer");

async function sendBookingConfirmationEmail(b) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: b.to,
    subject: `🎬 Booking Confirmed - ${b.movieTitle}`,
    text: `Your IMovies booking is confirmed!\n
Movie: ${b.movieTitle}
Theatre: ${b.theatre}
Date: ${b.showDate}
Time: ${b.showTime}
Seats: ${b.seats.join(", ")}
Amount: ₹${b.amount}
Booking ID: ${b.bookingId}

Thanks for choosing IMovies!`,
    html: `
      <div style="background:#11111b;color:white;padding:28px;
      font-family:Arial;border-radius:14px;max-width:480px;margin:auto">
        <h1 style="color:#a78bfa">🎬 IMovies</h1>
        <h2>Booking Confirmed!</h2>
        <p>Your movie night is ready.</p>
        <div style="background:#242237;padding:20px;border-radius:10px">
          <h2>${b.movieTitle}</h2>
          <p>📍 ${b.theatre}</p>
          <p>📅 ${b.showDate} | 🕒 ${b.showTime}</p>
          <p>💺 Seats: ${b.seats.join(", ")}</p>
          <h2 style="color:#c4b5fd">₹${b.amount}</h2>
          <p>Booking ID: ${b.bookingId}</p>
        </div>
        <p>Keep this email for your booking details.</p>
        <p style="color:#a78bfa">Thanks for choosing IMovies ❤️</p>
      </div>
    `,
  });
}

module.exports = { sendBookingConfirmationEmail };
