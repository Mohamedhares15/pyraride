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
  <title>Booking Confirmed - PyraRide</title>
</head>
<body style="margin:0; padding:0; background:#000000; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 80px;">
        <table role="presentation" style="width:600px; max-width:95%; background:rgba(28,28,30,0.95); border-radius:24px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.1);">
          <!-- Header - NO gradient, just dark with green checkmark -->
          <tr>
            <td style="padding:40px 32px; text-align:center; background:transparent;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <!-- Green checkmark circle matching design.png -->
                    <div style="width:64px;height:64px;border-radius:50%;background:rgba(16,185,129,0.2);border:2px solid rgba(16,185,129,0.4);display:inline-flex;align-items:center;justify-content:center;margin:0 auto;">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0 0 12px 0;font-size:36px;font-weight:700;color:#FFFFFF;line-height:1.2;">Booking Confirmed</h1>
                    <div style="font-size:16px;font-weight:400;line-height:1.4;color:#9CA3AF;">Your adventure is ready!</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Details Section - DARK card with simple white icons matching design.png -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <!-- All details in ONE section -->
              <div style="padding:24px; border-radius:0; background:transparent;">
                <!-- Date & Time -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="width:32px; vertical-align:top; padding-right:16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="18" height="15" rx="2"/>
                        <path d="M3 10h18M7 3v6M17 3v6"/>
                      </svg>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:6px;">DATE & TIME</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:4px;">${new Date(data.date).toLocaleDateString("en-US", {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                      <div style="font-size:14px;font-weight:400;color:#D1D5DB;line-height:1.3;">${data.startTime} – ${data.endTime}</div>
                    </td>
                  </tr>
                </table>
              
                <!-- Horse Information -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="width:32px; vertical-align:top; padding-right:16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z"/>
                      </svg>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:6px;">HORSE INFORMATION</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:4px;">${data.horseName}</div>
                      <div style="font-size:14px;font-weight:400;color:#D1D5DB;line-height:1.3;">${data.riders} ${data.riders === 1 ? "rider" : "riders"}</div>
                    </td>
                  </tr>
                </table>
              
                <!-- Location -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="width:32px; vertical-align:top; padding-right:16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:6px;">LOCATION</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:16px;">${data.stableName}, ${data.stableAddress}</div>
                      ${directionsLink
                        ? `<a href="${directionsLink}" target="_blank" style="display:block;padding:16px 24px;margin-top:12px;background:linear-gradient(90deg,#0d9488,#2563eb);color:#FFFFFF;font-size:15px;font-weight:600;border-radius:16px;text-decoration:none;text-align:center;">
                            Get Directions
                          </a>` : ``}
                    </td>
                  </tr>
                </table>
              
                <!-- Total Amount (with divider above) -->
                <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;margin-top:4px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:32px; vertical-align:top; padding-right:16px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                          <rect x="5" y="7" width="14" height="10" rx="1"/>
                          <path d="M5 7 Q6 6 7 7 Q8 6 9 7 Q10 6 11 7 Q12 6 13 7 Q14 6 15 7 Q16 6 17 7 Q18 6 19 7" stroke="rgba(28, 28, 30, 0.95)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        </svg>
                      </td>
                      <td style="vertical-align:top;">
                        <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:6px;">TOTAL AMOUNT</div>
                        <div style="font-size:24px;font-weight:700;color:#FFFFFF;line-height:1.2;margin-bottom:6px;">$${data.totalPrice.toFixed(2)}</div>
                        <div style="font-size:11px;font-weight:400;color:#9CA3AF;line-height:1.4;font-style:italic;">Payment will be processed on-site or via your preferred method</div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;background:transparent;border-top:1px solid rgba(255,255,255,0.1);">
              <div style="font-size:13px;color:#6B7280;line-height:1.6;">
                <div style="margin-bottom:8px;">
                  <a href="https://pyraride.vercel.app" style="color:#FFFFFF;text-decoration:none;font-weight:600;">PyraRide</a>
                </div>
                <div style="margin-bottom:4px;">
                  <a href="mailto:support@pyraride.com" style="color:#10b981;text-decoration:none;">support@pyraride.com</a>
                </div>
                <div style="font-size:11px;color:#6B7280;margin-top:12px;">
                  © ${new Date().getFullYear()} PyraRide. All rights reserved.
                </div>
              </div>
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

interface PasswordResetEmailData {
  email: string;
  fullName: string;
  resetLink: string;
}

function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your PyraRide Password</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'SF Pro','Segoe UI',system-ui,sans-serif;">
  <table role="presentation" style="width:100%;border-spacing:0;background-color:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 80px;">
        <table role="presentation" style="width:600px;max-width:95%;background:rgba(28,28,30,0.95);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.1);">
          <tr>
            <td style="padding:40px 32px;text-align:center;background:transparent;">
              <h1 style="margin:0 0 12px 0;font-size:32px;font-weight:700;color:#FFFFFF;line-height:1.2;">Reset your password</h1>
              <p style="margin:0;font-size:16px;font-weight:400;color:#D1D5DB;">Hi ${data.fullName}, we received a request to reset your password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <div style="padding:24px;border-radius:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);color:#F9FAFB;">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#E5E7EB;">
                  Click the button below to choose a new password. This link will expire in 60 minutes for security reasons.
                </p>
                <p style="margin:0 0 24px 0;">
                  <a href="${data.resetLink}" style="display:inline-block;padding:14px 28px;background:linear-gradient(90deg,#0d9488,#2563eb);color:#FFFFFF;font-size:15px;font-weight:600;border-radius:12px;text-decoration:none;">
                    Reset Password
                  </a>
                </p>
                <p style="margin:0;font-size:13px;color:#9CA3AF;">If you did not request this update, you can safely ignore this email. Your password will remain unchanged.</p>
              </div>
              <p style="margin:24px 0 0 0;font-size:12px;color:#6B7280;line-height:1.6;text-align:center;">
                For your security, this link can be used only once and expires in 60 minutes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;text-align:center;background:transparent;border-top:1px solid rgba(255,255,255,0.1);">
              <div style="font-size:12px;color:#6B7280;line-height:1.6;">
                <div style="margin-bottom:8px;">
                  <a href="https://pyraride.vercel.app" style="color:#FFFFFF;text-decoration:none;font-weight:600;">PyraRide</a>
                </div>
                <div style="margin-bottom:4px;">
                  Need help? <a href="mailto:support@pyraride.com" style="color:#10b981;text-decoration:none;">support@pyraride.com</a>
                </div>
                <div style="font-size:11px;color:#6B7280;margin-top:12px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</div>
              </div>
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

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: "Reset your PyraRide password",
      html: generatePasswordResetEmail(data),
      text: `Hi ${data.fullName},\n\nWe received a request to reset your PyraRide password.\nClick the link below to set a new password (valid for 60 minutes):\n\n${data.resetLink}\n\nIf you didn't request this, you can ignore this email.\n\n— The PyraRide Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

// Generic email sending function
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

