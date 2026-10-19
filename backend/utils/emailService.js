
const nodemailer = require("nodemailer");

async function sendBookingConfirmationEmail(booking) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: booking.to,
    subject: `Your iMovies booking is confirmed - ${booking.movieTitle}`,
    text: `
Hi,

Your movie booking has been confirmed!

Movie: ${booking.movieTitle}
Theatre: ${booking.theatre}
Date: ${booking.showDate}
Time: ${booking.showTime}
Seats: ${booking.seats.join(", ")}
Total Amount: Rs. ${booking.amount}
Booking ID: ${booking.bookingId}

Thank you for choosing iMovies.
Enjoy your movie!

Team iMovies
    `,
  });
}

module.exports = { sendBookingConfirmationEmail };
