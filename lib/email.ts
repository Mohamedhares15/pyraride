import nodemailer from "nodemailer";

interface BookingEmailData {
  bookingId: string;
  riderName: string;
  riderEmail: string;
  stableName: string;
  stableAddress: string;
  horseName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  riders: number;
}

// Create reusable transporter
function createTransporter() {
  // Use environment variables for email configuration
  // For Gmail, you'll need an app password
  // For other services, adjust accordingly
  
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("Email configuration not set. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // For Gmail, use App Password
    },
  });
}

// Professional HTML email template
function generateBookingConfirmationEmail(data: BookingEmailData): string {
  // Generate encoded Google Maps link
  const directionsLink = data.stableAddress
    ? `https://maps.google.com/?daddr=${encodeURIComponent(data.stableAddress)}`
    : "";
  
  // Get day of month for calendar icon
  const bookingDate = new Date(data.date);
  const dayOfMonth = bookingDate.getDate();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - PyraRide</title>
</head>
<body style="margin:0; padding:0; background:#18181b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#18181b;">
    <tr>
      <td align="center" style="padding:32px 0;">
        <table role="presentation" style="max-width:600px; min-width:340px; width:100%; background:#232328; border-radius:16px; overflow:hidden; box-shadow:0 4px 32px rgba(24,24,38,0.12);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 30px;text-align:center;">
              <div style="width:80px; height:80px; background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <svg viewBox="0 0 52 52" width="50" height="50"><circle cx="26" cy="26" r="26" fill="none"/><path fill="none" stroke="#fff" stroke-width="5" d="M16 27l8 8 14-16"/></svg>
              </div>
              <h1 style="margin:22px 0 10px;font-size:2rem;font-weight:800;line-height:1.2;color:#fff;letter-spacing:-0.5px;">Booking Confirmed</h1>
              <div style="font-size:1.2rem; color:rgba(255,255,255,0.90);">Your adventure is ready!</div>
            </td>
          </tr>
          
          <!-- Details Card - All sections inside one card matching reference -->
          <tr>
            <td style="padding:24px 18px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; background: #232328; border:2px solid #35353b;">
                <tr>
                  <td style="padding:22px 24px 24px 24px;">
                    <!-- Date&Time -->
                    <table width="100%" cellpadding="0" cellspacing="0" align="left" style="margin-bottom:18px;">
                      <tr>
                        <td style="width:56px; vertical-align:top;">
                          <svg width="44" height="44"><rect rx="12" width="44" height="44" fill="#2563eb"/><rect x="10" y="16" width="24" height="16" rx="4" fill="#fff" /><rect x="10" y="13" width="24" height="5" rx="2" fill="#1d4ed8" /><rect x="15" y="12" width="2.5" height="4" rx="1.25" fill="#2563eb"/><rect x="26.5" y="12" width="2.5" height="4" rx="1.25" fill="#2563eb"/><text x="50%" y="65%" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#2563eb">${dayOfMonth}</text></svg>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#94a3b8;">DATE &amp; TIME</div>
                          <div style="font-size:1.14rem;font-weight:600;color:#fff; margin-top:2px;">${new Date(data.date).toLocaleDateString("en-US", {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                          <div style="color:#cdd1d9;font-size:13px;">${data.startTime} - ${data.endTime}</div>
                        </td>
                      </tr>
                    </table>
                    <!-- Horse Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" align="left" style="margin-bottom:18px;">
                      <tr>
                        <td style="width:56px; vertical-align:top;">
                          <svg width="44" height="44"><rect rx="12" width="44" height="44" fill="#8b5cf6"/><path d="M22 14c-3 0-5.5 1.5-6.5 3.5-1-1-2.5-1.5-3.5-1-1 .5-1.5 1.5-1 2.5.5 1 1.5 1.5 2.5 1 .8-.3 1.5-.8 2-1.5.5 1 1.5 2 3 2.5 1.5.5 3 .5 4 0 .8.5 1.8.8 3 .8 1.2 0 2.2-.3 3-.8 1 .5 2.5.5 4 0 1.5-.5 2.5-1.5 3-2.5.5.7 1.2 1.2 2 1.5 1 .5 2 .5 2.5-1 .5-1 0-2-1-2.5-1-.5-2.5 0-3.5 1-1-2-3.5-3.5-6.5-3.5z" fill="#fff"/><circle cx="19" cy="20" r="1.5" fill="#8b5cf6"/><path d="M16 16l1 2-1 1v-3z" fill="#fff"/><path d="M28 16l-1 2 1 1v-3z" fill="#fff"/><ellipse cx="22" cy="26" rx="3" ry="2" fill="#fff" opacity="0.9"/></svg>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#94a3b8;">HORSE INFORMATION</div>
                          <div style="font-size:1.08rem;font-weight:600;color:#fff; margin-top:2px;">${data.horseName}</div>
                          <div style="color:#cdd1d9;font-size:13px;">${data.riders} ${data.riders === 1 ? "rider" : "riders"}</div>
                        </td>
                      </tr>
                    </table>
                    <!-- Location Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" align="left" style="margin-bottom:18px;">
                      <tr>
                        <td style="width:56px; vertical-align:top;">
                          <svg width="44" height="44"><rect rx="12" width="44" height="44" fill="#10b981"/><path d="M22 13c-4.2 0-7.5 3.18-7.5 7.09 0 5.9 7.13 12.4 7.41 12.64a1 1 0 0 0 1.18 0C22.37 32.5 29.5 26 29.5 20.09 29.5 16.18 26.2 13 22 13zm0 2c3.36 0 6 2.7 6 6.09 0 4.36-5.01 9.18-6 10.01-.99-.83-6-5.65-6-10.01C16 17.7 18.64 15 22 15zm0 2.2a3.1 3.1 0 1 0 .001 6.201A3.1 3.1 0 0 0 22 17.2z" fill="#fff"/><circle cx="22" cy="22.5" r="2" fill="#10b981"/></svg>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#94a3b8;">LOCATION</div>
                          <div style="font-size:1.08rem;font-weight:600;color:#fff; margin-top:2px;line-height:1.4;">${data.stableName}</div>
                          <div style="color:#cdd1d9;font-size:13px; margin-bottom:12px;line-height:1.4;">${data.stableAddress}</div>
                          ${directionsLink
                            ? `<a href="${directionsLink}" target="_blank" style="display:inline-block;padding:12px 28px;margin-top:6px;background:linear-gradient(90deg,#0d9488 0%,#2563eb 100%);color:#fff;font-size:1rem;font-weight:700;border-radius:999px;text-decoration:none;box-shadow:0 3px 12px 0 rgba(5,150,105,0.3);width:100%;text-align:center;">
                              <span style="vertical-align:middle;display:inline-block;margin-right:8px;">
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;">
                                  <path d="M6 16h16.34l-5.3-5.29a1 1 0 1 1 1.42-1.42l7 7a1 1 0 0 1 0 1.42l-7 7a1 1 0 1 1-1.42-1.42l5.3-5.29H6a1 1 0 1 1 0-2z" fill="#fff"/>
                                </svg>
                              </span>
                              Get Directions
                            </a>` : ``}
                        </td>
                      </tr>
                    </table>
                    <!-- Total Amount - INSIDE the same card -->
                    <table width="100%" cellpadding="0" cellspacing="0" align="left" style="margin-bottom:0;">
                      <tr>
                        <td style="width:56px; vertical-align:top;">
                          <svg width="44" height="44"><rect rx="12" width="44" height="44" fill="#2563eb"/><rect x="10" y="14" width="24" height="20" rx="2" fill="#fff" /><line x1="13" y1="18" x2="31" y2="18" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" /><line x1="13" y1="22" x2="31" y2="22" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" /><line x1="13" y1="26" x2="27" y2="26" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" /><path d="M10 14 Q12 13 14 14 Q16 13 18 14 Q20 13 22 14 Q24 13 26 14 Q28 13 30 14 Q32 13 34 14" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round" /></svg>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#94a3b8;">TOTAL AMOUNT</div>
                          <div style="font-size:1.32em;font-weight:700;color:#fff; margin-top:2px; margin-bottom:4px;">$${data.totalPrice.toFixed(2)}</div>
                          <div style="color:#cdd1d9;font-size:13px;">Payment will be processed on-site or via your preferred method</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:36px;"></td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#121217;color:#6b7280;font-size:15px;padding:28px 24px 24px 24px;text-align:center;border-top:1.5px solid #232323;">
              <span style="display:inline-block;font-family:inherit;font-size:1.11em;font-weight:800;letter-spacing:-1.5px;color:#10b981;">PyraRide</span>
              <div style="font-size:0.98em;color:#a1a1aa;margin-top:5px;">support@pyraride.com</div>
              <div style="color:#a1a1aa;margin-top:10px;font-size:11.5px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.riderEmail,
      subject: `🎉 Booking Confirmed - ${data.stableName}`,
      html: generateBookingConfirmationEmail(data),
      text: `Booking Confirmed!\n\nYour booking at ${data.stableName} has been confirmed.\n\nBooking ID: ${data.bookingId}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}\nHorse: ${data.horseName}\nTotal: $${data.totalPrice.toFixed(2)}\n\nThank you for choosing PyraRide!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

