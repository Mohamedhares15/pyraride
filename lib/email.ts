import nodemailer from "nodemailer";
import { Resend } from "resend";

// Initialize Resend for fast email delivery
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// PyraRide Logo as base64 for email embedding (circular horse + pyramid)
const PYRARIDE_LOGO_URL = "https://pyraride.vercel.app/logo.png";

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
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:4px;">${new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
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
                  <a href="https://www.pyrarides.com" style="color:#FFFFFF;text-decoration:none;font-weight:600;">PyraRide</a>
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
                  <a href="https://www.pyrarides.com" style="color:#FFFFFF;text-decoration:none;font-weight:600;">PyraRide</a>
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

// Email data for booking cancellation
interface BookingCancellationEmailData {
  bookingId: string;
  riderName: string;
  riderEmail: string;
  stableName: string;
  horseName: string;
  date: string;
  startTime: string;
  endTime: string;
  cancellationReason?: string;
  cancelledBy: "rider" | "owner" | "admin";
}

// Email template for booking cancellation
function generateBookingCancellationEmail(data: BookingCancellationEmailData): string {
  const isOwnerCancelled = data.cancelledBy === "owner";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - PyraRide</title>
</head>
<body style="margin:0; padding:0; background:#000000; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 80px;">
        <table role="presentation" style="width:600px; max-width:95%; background:rgba(28,28,30,0.95); border-radius:24px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.1);">
          <tr>
            <td style="padding:40px 32px; text-align:center; background:transparent;">
              <div style="width:64px;height:64px;border-radius:50%;background:rgba(239,68,68,0.2);border:2px solid rgba(239,68,68,0.4);display:inline-flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6l12 12" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <h1 style="margin:0 0 12px 0;font-size:36px;font-weight:700;color:#FFFFFF;line-height:1.2;">Booking Cancelled</h1>
              <div style="font-size:16px;font-weight:400;line-height:1.4;color:#9CA3AF;">
                ${isOwnerCancelled ? "The stable owner has cancelled your booking" : "Your booking has been cancelled"}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <div style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="width:32px; vertical-align:top; padding-right:16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.5">
                        <rect x="3" y="6" width="18" height="15" rx="2"/>
                        <path d="M3 10h18M7 3v6M17 3v6"/>
                      </svg>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;margin-bottom:6px;">CANCELLED BOOKING</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;margin-bottom:4px;">${new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div style="font-size:14px;font-weight:400;color:#D1D5DB;">${data.startTime} – ${data.endTime}</div>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="width:32px; vertical-align:top; padding-right:16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF">
                        <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z"/>
                      </svg>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;margin-bottom:6px;">HORSE</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;">${data.horseName}</div>
                      <div style="font-size:14px;font-weight:400;color:#D1D5DB;">${data.stableName}</div>
                    </td>
                  </tr>
                </table>
                ${data.cancellationReason ? `
                <div style="padding:16px;background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;border-radius:8px;margin-bottom:24px;">
                  <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#ef4444;margin-bottom:6px;">REASON</div>
                  <div style="font-size:14px;color:#F9FAFB;">${data.cancellationReason}</div>
                </div>
                ` : ''}
                ${isOwnerCancelled ? `
                <div style="padding:16px;background:rgba(59,130,246,0.1);border-left:3px solid #3b82f6;border-radius:8px;margin-top:24px;">
                  <div style="font-size:13px;color:#F9FAFB;line-height:1.6;">
                    <strong>What happens next?</strong><br>
                    If you made a payment, a full refund will be processed automatically. Please allow 5-7 business days for the refund to appear in your account.
                  </div>
                </div>
                ` : ''}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;text-align:center;background:transparent;border-top:1px solid rgba(255,255,255,0.1);">
              <div style="font-size:13px;color:#6B7280;line-height:1.6;">
                <a href="https://www.pyrarides.com" style="color:#FFFFFF;text-decoration:none;font-weight:600;">PyraRide</a><br>
                <a href="mailto:support@pyraride.com" style="color:#10b981;text-decoration:none;">support@pyraride.com</a><br>
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

export async function sendBookingCancellationEmail(data: BookingCancellationEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.riderEmail,
      subject: data.cancelledBy === "owner" ? `⚠️ Booking Cancelled by Stable - ${data.stableName}` : `Booking Cancelled - ${data.stableName}`,
      html: generateBookingCancellationEmail(data),
      text: `${data.cancelledBy === "owner" ? "The stable owner has cancelled your booking" : "Your booking has been cancelled"} at ${data.stableName}.\n\nBooking ID: ${data.bookingId}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}\nHorse: ${data.horseName}${data.cancellationReason ? `\nReason: ${data.cancellationReason}` : ''}\n\n${data.cancelledBy === "owner" ? "If you made a payment, a full refund will be processed automatically.\n\n" : ""}Thank you for choosing PyraRide!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Cancellation email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return false;
  }
}

// Email data for booking reschedule
interface BookingRescheduleEmailData {
  bookingId: string;
  riderName: string;
  riderEmail: string;
  stableName: string;
  horseName: string;
  oldDate: string;
  oldStartTime: string;
  oldEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  rescheduledBy: "rider" | "owner" | "admin";
}

// Email template for booking reschedule
function generateBookingRescheduleEmail(data: BookingRescheduleEmailData): string {
  const isOwnerRescheduled = data.rescheduledBy === "owner";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Rescheduled - PyraRide</title>
</head>
<body style="margin:0; padding:0; background:#000000; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 80px;">
        <table role="presentation" style="width:600px; max-width:95%; background:rgba(28,28,30,0.95); border-radius:24px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.1);">
          <tr>
            <td style="padding:40px 32px; text-align:center; background:transparent;">
              <div style="width:64px;height:64px;border-radius:50%;background:rgba(251,191,36,0.2);border:2px solid rgba(251,191,36,0.4);display:inline-flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#fbbf24" stroke-width="2"/>
                </svg>
              </div>
              <h1 style="margin:0 0 12px 0;font-size:36px;font-weight:700;color:#FFFFFF;line-height:1.2;">Booking Rescheduled</h1>
              <div style="font-size:16px;font-weight:400;line-height:1.4;color:#9CA3AF;">
                ${isOwnerRescheduled ? "The stable owner has rescheduled your booking" : "Your booking has been rescheduled"}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <div style="padding:24px;">
                <div style="margin-bottom:24px;padding:16px;background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;border-radius:8px;">
                  <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#ef4444;margin-bottom:6px;">OLD TIME</div>
                  <div style="font-size:14px;color:#F9FAFB;">${new Date(data.oldDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div style="font-size:14px;color:#D1D5DB;">${data.oldStartTime} – ${data.oldEndTime}</div>
                </div>
                <div style="margin-bottom:24px;padding:16px;background:rgba(16,185,129,0.1);border-left:3px solid #10b981;border-radius:8px;">
                  <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#10b981;margin-bottom:6px;">NEW TIME</div>
                  <div style="font-size:16px;font-weight:600;color:#FFFFFF;margin-bottom:4px;">${new Date(data.newDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div style="font-size:14px;color:#D1D5DB;">${data.newStartTime} – ${data.newEndTime}</div>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:32px; vertical-align:top; padding-right:16px;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF">
                        <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z"/>
                      </svg>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;margin-bottom:6px;">HORSE</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;">${data.horseName}</div>
                      <div style="font-size:14px;font-weight:400;color:#D1D5DB;">${data.stableName}</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;text-align:center;background:transparent;border-top:1px solid rgba(255,255,255,0.1);">
              <div style="font-size:13px;color:#6B7280;line-height:1.6;">
                <a href="https://www.pyrarides.com" style="color:#FFFFFF;text-decoration:none;font-weight:600;">PyraRide</a><br>
                <a href="mailto:support@pyraride.com" style="color:#10b981;text-decoration:none;">support@pyraride.com</a><br>
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

export async function sendBookingRescheduleEmail(data: BookingRescheduleEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.riderEmail,
      subject: data.rescheduledBy === "owner" ? `🔄 Booking Rescheduled by Stable - ${data.stableName}` : `Booking Rescheduled - ${data.stableName}`,
      html: generateBookingRescheduleEmail(data),
      text: `${data.rescheduledBy === "owner" ? "The stable owner has rescheduled your booking" : "Your booking has been rescheduled"} at ${data.stableName}.\n\nBooking ID: ${data.bookingId}\n\nOld Time: ${data.oldDate} ${data.oldStartTime} - ${data.oldEndTime}\nNew Time: ${data.newDate} ${data.newStartTime} - ${data.newEndTime}\nHorse: ${data.horseName}\n\nThank you for choosing PyraRide!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reschedule email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reschedule email:", error);
    return false;
  }
}

// Email data for owner notification
interface OwnerBookingNotificationData {
  ownerEmail: string;
  riderName: string;
  riderEmail: string;
  riderPhone?: string;
  horseName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingId: string;
}

function generateOwnerBookingNotificationEmail(data: OwnerBookingNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received - PyraRide</title>
</head>
<body style="margin:0; padding:0; background:#000000; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif;">
  <table role="presentation" style="width:100%; border-spacing:0; background-color:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 80px;">
        <table role="presentation" style="width:600px; max-width:95%; background:rgba(28,28,30,0.95); border-radius:24px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding:40px 32px; text-align:center; background:transparent;">
              <!-- PyraRide Logo -->
              <div style="margin-bottom:24px;">
                <img src="${PYRARIDE_LOGO_URL}" alt="PyraRide" width="80" height="80" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.2);" />
              </div>
              <!-- Success Icon -->
              <div style="width:64px;height:64px;border-radius:50%;background:rgba(16,185,129,0.2);border:2px solid rgba(16,185,129,0.4);display:inline-flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#10b981"/>
                </svg>
              </div>
              <h1 style="margin:0 0 12px 0;font-size:32px;font-weight:700;color:#FFFFFF;line-height:1.2;">New Booking! 🎉</h1>
              <div style="font-size:16px;font-weight:400;line-height:1.4;color:#9CA3AF;">A rider has just booked a ride at your stable</div>
            </td>
          </tr>

          <!-- Booking Details Card -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <div style="padding:24px; border-radius:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);">
                
                <!-- Horse Info -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="width:40px; vertical-align:top; padding-right:16px;">
                      <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#0d9488,#2563eb);display:flex;align-items:center;justify-content:center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z"/></svg>
                      </div>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:4px;">HORSE</div>
                      <div style="font-size:18px;font-weight:700;color:#FFFFFF;line-height:1.3;">${data.horseName}</div>
                    </td>
                  </tr>
                </table>

                <!-- Date & Time -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="width:40px; vertical-align:top; padding-right:16px;">
                      <div style="width:40px;height:40px;border-radius:10px;background:rgba(251,191,36,0.2);display:flex;align-items:center;justify-content:center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M7 3v6M17 3v6"/></svg>
                      </div>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:4px;">DATE & TIME</div>
                      <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;">${new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div style="font-size:14px;font-weight:400;color:#D1D5DB;line-height:1.3;">${data.startTime} – ${data.endTime}</div>
                    </td>
                  </tr>
                </table>

                <!-- Rider Info Section -->
                <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;margin-top:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                    <tr>
                      <td style="width:40px; vertical-align:top; padding-right:16px;">
                        <div style="width:40px;height:40px;border-radius:10px;background:rgba(59,130,246,0.2);display:flex;align-items:center;justify-content:center;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-4.4 3.6-8 8-8h-2c-4.4 0-8 3.6-8 8"/></svg>
                        </div>
                      </td>
                      <td style="vertical-align:top;">
                        <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#6B7280;line-height:1.2;margin-bottom:4px;">RIDER</div>
                        <div style="font-size:16px;font-weight:600;color:#FFFFFF;line-height:1.3;margin-bottom:2px;">${data.riderName}</div>
                        <div style="font-size:14px;color:#D1D5DB;line-height:1.3;">${data.riderEmail}</div>
                        ${data.riderPhone ? `<div style="font-size:14px;color:#10b981;line-height:1.3;margin-top:4px;">📞 ${data.riderPhone}</div>` : ''}
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Revenue Box -->
                <div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:16px;margin-top:16px;text-align:center;">
                  <div style="font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#10b981;margin-bottom:6px;">BOOKING VALUE</div>
                  <div style="font-size:28px;font-weight:700;color:#FFFFFF;">EGP ${data.totalPrice}</div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-top:24px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://pyraride.vercel.app'}/dashboard/stable" style="display:inline-block;padding:16px 32px;background:linear-gradient(90deg,#0d9488,#2563eb);color:#FFFFFF;font-size:16px;font-weight:600;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(13,148,136,0.4);">
                  View in Dashboard →
                </a>
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

export async function sendOwnerBookingNotification(data: OwnerBookingNotificationData): Promise<boolean> {
  const subject = `🐴 New Booking: ${data.horseName} - ${new Date(data.date).toLocaleDateString()}`;
  const html = generateOwnerBookingNotificationEmail(data);
  const text = `New Booking Received!\n\nHorse: ${data.horseName}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}\nRider: ${data.riderName}\nPhone: ${data.riderPhone || 'N/A'}\nTotal: EGP ${data.totalPrice}\n\nLog in to your dashboard to view details.`;

  // Try Resend first (instant delivery)
  if (resend) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: "PyraRide <notifications@pyraride.com>",
        to: data.ownerEmail,
        subject,
        html,
        text,
      });

      if (error) {
        console.error("Resend error:", error);
        // Fall through to nodemailer
      } else {
        console.log("Owner notification sent via Resend:", result?.id);
        return true;
      }
    } catch (resendError) {
      console.error("Resend failed, trying nodemailer:", resendError);
    }
  }

  // Fallback to nodemailer
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide System" <${process.env.EMAIL_USER}>`,
      to: data.ownerEmail,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Owner notification email sent via SMTP:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending owner notification:", error);
    return false;
  }
}


