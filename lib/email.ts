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
<body style="margin:0; padding:0; background:#1C1C1E; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#1C1C1E;">
    <tr>
      <td align="center" style="padding:48px 20px 80px;">
        <table role="presentation" style="width:720px; max-width:100%; background:#2C2C2E; border-radius:28px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <!-- Header - Green gradient IDENTICAL to design.png -->
          <tr>
            <td style="padding:32px 28px; text-align:center; background:linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <!-- Check circle: 64x64, radius 32, darker green -->
                    <div style="width:64px;height:64px;border-radius:32px;background:rgba(255,255,255,0.15);display:inline-flex;align-items:center;justify-content:center;margin:0 auto;">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- H1: 32px, Semibold, white -->
                    <h1 style="margin:0 0 8px 0;font-size:32px;font-weight:600;letter-spacing:-0.01em;color:#FFFFFF;line-height:1.2;">Booking Confirmed</h1>
                    <!-- Subtitle: 18px, Regular, white -->
                    <div style="font-size:18px;font-weight:400;line-height:1.2;color:#FFFFFF;">Your adventure is ready!</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Details Cards - DARK BACKGROUND with SEPARATE sections -->
          <tr>
            <td style="padding:24px 28px 28px 28px;">
              <!-- Date & Time Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="width:40px; vertical-align:top; padding-right:12px;">
                    <div style="width:40px;height:40px;border-radius:12px;background:#5C5CFF;display:flex;align-items:center;justify-content:center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="14" rx="2" stroke="none" fill="#FFFFFF" opacity="0.9"/>
                        <rect x="4" y="10" width="16" height="10" rx="1" fill="#FFFFFF"/>
                        <path d="M4 10h16M8 4v4M16 4v4" stroke="#5C5CFF" stroke-width="1.5" stroke-linecap="round"/>
                        <text x="12" y="17" text-anchor="middle" font-size="10" fill="#5C5CFF" font-weight="600">${dayOfMonth}</text>
                      </svg>
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#A0A0A0;line-height:1.2;margin-bottom:8px;">DATE &amp; TIME</div>
                    <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:4px;">${new Date(data.date).toLocaleDateString("en-US", {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                    <div style="font-size:14px;font-weight:400;color:#A0A0A0;line-height:1.3;">${data.startTime} - ${data.endTime}</div>
                  </td>
                </tr>
              </table>
              
              <!-- Horse Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="width:40px; vertical-align:top; padding-right:12px;">
                    <div style="width:40px;height:40px;border-radius:12px;background:#9B59B6;display:flex;align-items:center;justify-content:center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z" fill="#FFFFFF"/>
                        <circle cx="12" cy="11" r="1" fill="#9B59B6"/>
                      </svg>
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#A0A0A0;line-height:1.2;margin-bottom:8px;">HORSE INFORMATION</div>
                    <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:4px;">${data.horseName}</div>
                    <div style="font-size:14px;font-weight:400;color:#A0A0A0;line-height:1.3;">${data.riders} ${data.riders === 1 ? "rider" : "riders"}</div>
                  </td>
                </tr>
              </table>
              
              <!-- Location Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="width:40px; vertical-align:top; padding-right:12px;">
                    <div style="width:40px;height:40px;border-radius:12px;background:#27AE60;display:flex;align-items:center;justify-content:center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FFFFFF"/>
                      </svg>
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#A0A0A0;line-height:1.2;margin-bottom:8px;">LOCATION</div>
                    <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:4px;">${data.stableName}</div>
                    <div style="font-size:14px;font-weight:400;color:#A0A0A0;line-height:1.3;margin-bottom:12px;">${data.stableAddress}</div>
                    ${directionsLink
                      ? `<a href="${directionsLink}" target="_blank" style="display:block;height:56px;padding:0 24px;margin-top:12px;background:linear-gradient(90deg,#3498DB,#2980B9);color:#FFFFFF;font-size:16px;font-weight:600;border-radius:16px;text-decoration:none;text-align:center;line-height:56px;">
                          Get Directions →
                        </a>` : ``}
                  </td>
                </tr>
              </table>
              
              <!-- Total Amount Card -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px; vertical-align:top; padding-right:12px;">
                    <div style="width:40px;height:40px;border-radius:12px;background:#3498DB;display:flex;align-items:center;justify-content:center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="7" width="14" height="10" rx="1" fill="#FFFFFF"/>
                        <line x1="7" y1="9" x2="17" y2="9" stroke="#3498DB" stroke-width="1.5" stroke-linecap="round"/>
                        <line x1="7" y1="12" x2="17" y2="12" stroke="#3498DB" stroke-width="1.5" stroke-linecap="round"/>
                        <line x1="7" y1="15" x2="14" y2="15" stroke="#3498DB" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#A0A0A0;line-height:1.2;margin-bottom:8px;">TOTAL AMOUNT</div>
                    <div style="font-size:20px;font-weight:700;color:#FFFFFF;line-height:1.2;margin-bottom:8px;">$${data.totalPrice.toFixed(2)}</div>
                    <div style="font-size:12px;font-weight:400;color:#A0A0A0;line-height:1.3;">Payment will be processed on-site or via your preferred method</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#1C1C1E;color:#A0A0A0;font-size:14px;padding:24px 28px;text-align:center;border-top:1px solid #3A3A3C;">
              <div style="font-weight:600;color:#FFFFFF;margin-bottom:4px;">PyraRide</div>
              <div style="font-size:13px;color:#3498DB;margin-top:4px;"><a href="mailto:support@pyraride.com" style="color:#3498DB;text-decoration:none;">support@pyraride.com</a></div>
              <div style="font-size:11px;color:#A0A0A0;margin-top:8px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</div>
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

