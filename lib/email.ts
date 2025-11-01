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
<body style="margin:0; padding:0; background:#f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:48px 152px 80px;">
        <table role="presentation" style="width:720px; max-width:100%; background:#FFFFFF; border-radius:28px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.1);">
          <!-- Header - Green gradient IDENTICAL to design.png -->
          <tr>
            <td style="padding:32px 28px; text-align:center; background:linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <!-- Check circle: 64x64, radius 32, white with transparency -->
                    <div style="width:64px;height:64px;border-radius:32px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;margin:0 auto;backdrop-filter:blur(8px);">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- H1: 32px, Semibold, -1% letter spacing -->
                    <h1 style="margin:0 0 8px 0;font-size:32px;font-weight:600;letter-spacing:-0.01em;color:#FFFFFF;line-height:1.2;">Booking Confirmed</h1>
                    <!-- Subtitle: 18px, Regular, 120% line-height, white with opacity -->
                    <div style="font-size:18px;font-weight:400;line-height:1.2;color:rgba(255,255,255,0.9);">Your adventure is ready!</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Details Panel - LIGHT GRAY IDENTICAL to design.png -->
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px; background:#F5F5F5; box-shadow:0 2px 8px rgba(0,0,0,0.08); border:1px solid #E5E7EB; padding:24px;">
                <!-- Date&Time - pixel perfect -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="width:40px; vertical-align:top; padding-right:12px;">
                          <div style="width:40px;height:40px;border-radius:12px;background:#2563eb;display:flex;align-items:center;justify-content:center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:#FFFFFF;">
                              <rect x="4" y="6" width="16" height="14" rx="2" stroke="none" fill="#FFFFFF" opacity="0.9"/>
                              <rect x="4" y="10" width="16" height="10" rx="1" fill="#FFFFFF"/>
                              <path d="M4 10h16M8 4v4M16 4v4" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round"/>
                              <text x="12" y="17" text-anchor="middle" font-size="10" fill="#2563eb" font-weight="600">${dayOfMonth}</text>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:top;">
                          <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;line-height:1.2;margin-bottom:8px;">DATE &amp; TIME</div>
                          <div style="font-size:16px;font-weight:600;color:#1f2937;line-height:1.3;margin-bottom:4px;">${new Date(data.date).toLocaleDateString("en-US", {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                          <div style="font-size:14px;font-weight:400;color:#6b7280;line-height:1.3;">${data.startTime} - ${data.endTime}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Horse Info - pixel perfect -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="width:40px; vertical-align:top; padding-right:12px;">
                          <div style="width:40px;height:40px;border-radius:12px;background:#8b5cf6;display:flex;align-items:center;justify-content:center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:#FFFFFF;">
                              <path d="M22 14c-3 0-5.5 1.5-6.5 3.5-1-1-2.5-1.5-3.5-1-1 .5-1.5 1.5-1 2.5.5 1 1.5 1.5 2.5 1 .8-.3 1.5-.8 2-1.5.5 1 1.5 2 3 2.5 1.5.5 3 .5 4 0 .8.5 1.8.8 3 .8 1.2 0 2.2-.3 3-.8 1 .5 2.5.5 4 0 1.5-.5 2.5-1.5 3-2.5.5.7 1.2 1.2 2 1.5 1 .5 2 .5 2.5-1 .5-1 0-2-1-2.5-1-.5-2.5 0-3.5 1-1-2-3.5-3.5-6.5-3.5z" fill="#FFFFFF"/>
                              <circle cx="19" cy="20" r="1.5" fill="#8b5cf6"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:top;">
                          <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;line-height:1.2;margin-bottom:8px;">HORSE INFORMATION</div>
                          <div style="font-size:16px;font-weight:600;color:#1f2937;line-height:1.3;margin-bottom:4px;">${data.horseName}</div>
                          <div style="font-size:14px;font-weight:400;color:#6b7280;line-height:1.3;">${data.riders} ${data.riders === 1 ? "rider" : "riders"}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Location Info - pixel perfect -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="width:40px; vertical-align:top; padding-right:12px;">
                          <div style="width:40px;height:40px;border-radius:12px;background:#10b981;display:flex;align-items:center;justify-content:center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:#FFFFFF;">
                              <path d="M12 13c-4.2 0-7.5 3.18-7.5 7.09 0 5.9 7.13 12.4 7.41 12.64a1 1 0 0 0 1.18 0C12.37 32.5 19.5 26 19.5 20.09 19.5 16.18 16.2 13 12 13zm0 2c3.36 0 6 2.7 6 6.09 0 4.36-5.01 9.18-6 10.01-.99-.83-6-5.65-6-10.01C6 17.7 8.64 15 12 15zm0 2.2a3.1 3.1 0 1 0 .001 6.201A3.1 3.1 0 0 0 12 17.2z" fill="#FFFFFF"/>
                              <circle cx="12" cy="20.5" r="2" fill="#10b981"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:top;">
                          <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;line-height:1.2;margin-bottom:8px;">LOCATION</div>
                          <div style="font-size:16px;font-weight:600;color:#1f2937;line-height:1.3;margin-bottom:4px;">${data.stableName}</div>
                          <div style="font-size:14px;font-weight:400;color:#6b7280;line-height:1.3;margin-bottom:12px;">${data.stableAddress}</div>
                          ${directionsLink
                            ? `<a href="${directionsLink}" target="_blank" style="display:block;height:56px;padding:0 24px;margin-top:20px;background:linear-gradient(90deg,#0D7F94,#144A78);color:#FFFFFF;font-size:16px;font-weight:600;border-radius:16px;text-decoration:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);text-align:center;line-height:56px;">
                              Get Directions →
                            </a>` : ``}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Total Amount - pixel perfect with divider -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:24px;">
                      <tr>
                        <td style="width:40px; vertical-align:top; padding-right:12px;">
                          <div style="width:40px;height:40px;border-radius:12px;background:#2563eb;display:flex;align-items:center;justify-content:center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:#FFFFFF;">
                              <rect x="5" y="7" width="14" height="10" rx="1" fill="#FFFFFF"/>
                              <line x1="7" y1="9" x2="17" y2="9" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round"/>
                              <line x1="7" y1="12" x2="17" y2="12" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round"/>
                              <line x1="7" y1="15" x2="14" y2="15" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round"/>
                              <path d="M5 7 Q6 6 7 7 Q8 6 9 7 Q10 6 11 7 Q12 6 13 7 Q14 6 15 7 Q16 6 17 7 Q18 6 19 7" stroke="#2563eb" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:top;">
                          <div style="font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;line-height:1.2;margin-bottom:8px;">TOTAL AMOUNT</div>
                          <div style="font-size:20px;font-weight:700;color:#1f2937;line-height:1.2;margin-bottom:8px;">$${data.totalPrice.toFixed(2)}</div>
                          <div style="font-size:12px;font-weight:400;color:#6b7280;line-height:1.3;">Payment will be processed on-site or via your preferred method</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:28px;"></td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;color:#6b7280;font-size:14px;padding:24px 28px;text-align:center;border-top:1px solid #E5E7EB;">
              <div style="font-weight:600;color:#1f2937;margin-bottom:4px;">PyraRide</div>
              <div style="font-size:13px;color:#6b7280;margin-top:4px;">support@pyraride.com</div>
              <div style="font-size:11px;color:#6b7280;margin-top:8px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</div>
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

