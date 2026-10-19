
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBookingConfirmationEmail(b) {
  const { data, error } = await resend.emails.send({
    from: "IMovies <onboarding@resend.dev>",
    to: b.to,
    subject: `🎬 Booking Confirmed - ${b.movieTitle}`,
    html: `
      <div style="background:#11111b;color:white;padding:28px;
      font-family:Arial;border-radius:14px;max-width:480px;margin:auto">
        <h1 style="color:#a78bfa">🎬 IMovies</h1>
        <h2>Booking Confirmed!</h2>
        <p>Your movie ticket is ready.</p>
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

  if (error) throw new Error(error.message);
  return data;
}


module.exports = { sendBookingConfirmationEmail };
