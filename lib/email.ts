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

// Professional HTML email template matching the Hero section aesthetic
function generateBookingConfirmationEmail(data: BookingEmailData): string {
  // Generate encoded Google Maps link
  const directionsLink = data.stableAddress
    ? `https://maps.google.com/?daddr=${encodeURIComponent(data.stableAddress)}`
    : "";

  // Use public URLs for images
  const HERO_BG_URL = "https://www.pyrarides.com/hero-bg.webp";
  const LOGO_URL = "https://www.pyrarides.com/logo.png";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - PyraRide</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Full-width Hero Section with Pyramids Background -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:0;">
        
        <!-- Hero Banner with Background Image -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-image:url('${HERO_BG_URL}'); background-size:cover; background-position:center;">
          <tr>
            <td align="center" style="padding:80px 20px; background: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8));">
              
              <!-- PyraRide Branding -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Dashed line decorator -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="width:60px; border-top:1px dashed rgba(255,255,255,0.45);"></td>
                        <td style="padding:0 16px; color:rgba(255,255,255,0.7); font-size:11px; font-weight:600; letter-spacing:0.6em; text-transform:uppercase;">PYRARIDE</td>
                        <td style="width:60px; border-top:1px dashed rgba(255,255,255,0.45);"></td>
                      </tr>
                    </table>
                    
                    <!-- Main Headline - Cinematic Style -->
                    <h1 style="margin:0 0 8px; font-family:'Cinzel', serif; font-size:42px; font-weight:600; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.04em; text-shadow:0 15px 30px rgba(0,0,0,0.7);">
                      Ride Into
                    </h1>
                    <h1 style="margin:0 0 24px; font-family:'Cinzel', serif; font-size:42px; font-weight:600; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.04em; text-shadow:0 15px 30px rgba(0,0,0,0.7);">
                      Adventure!
                    </h1>
                    
                    <!-- Dashed line with dot decorator -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
                      <tr>
                        <td style="width:60px; border-top:1px dashed rgba(255,255,255,0.45);"></td>
                        <td style="padding:0 16px;">
                          <div style="width:8px; height:8px; border-radius:50%; border:1px solid rgba(255,255,255,0.4); background:rgba(255,255,255,0.4); box-shadow:0 0 8px rgba(255,255,255,0.45);"></div>
                        </td>
                        <td style="width:60px; border-top:1px dashed rgba(255,255,255,0.45);"></td>
                      </tr>
                    </table>
                    
                    <!-- Confirmed Badge -->
                    <div style="display:inline-block; padding:12px 28px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); border-radius:100px; margin-bottom:16px;">
                      <span style="color:#10b981; font-size:13px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">✓ BOOKING CONFIRMED</span>
                    </div>
                    
                    <p style="margin:0; color:rgba(255,255,255,0.9); font-size:16px; font-weight:300;">
                      Your trusted ride at the Pyramids is ready
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
        
        <!-- Main Content Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background:#0a0a0a; margin-top:-40px; border:1px solid rgba(255,255,255,0.1); border-radius:28px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.55);">
          
          <!-- Booking Details -->
          <tr>
            <td style="padding:48px 40px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                
                <!-- Horse & Stable Section -->
                <tr>
                  <td style="padding-bottom:32px; border-bottom:1px solid rgba(255,255,255,0.08);">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="60" style="vertical-align:top; padding-right:20px;">
                          <div style="width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg, #d4af37 0%, #f59e0b 100%); display:flex; align-items:center; justify-content:center;">
                            <span style="font-size:28px;">🐴</span>
                          </div>
                        </td>
                        <td style="vertical-align:top;">
                          <div style="color:rgba(255,255,255,0.5); font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:6px;">YOUR HORSE</div>
                          <div style="color:#FFFFFF; font-size:22px; font-weight:700; margin-bottom:4px;">${data.horseName}</div>
                          <div style="color:rgba(255,255,255,0.6); font-size:14px;">at <span style="color:#d4af37; font-weight:500;">${data.stableName}</span></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Date & Time Row -->
                <tr>
                  <td style="padding:32px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" style="vertical-align:top; padding-right:16px;">
                          <div style="color:rgba(255,255,255,0.5); font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">📅 DATE</div>
                          <div style="color:#FFFFFF; font-size:18px; font-weight:600;">${new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                        </td>
                        <td width="50%" style="vertical-align:top; padding-left:16px; border-left:1px solid rgba(255,255,255,0.08);">
                          <div style="color:rgba(255,255,255,0.5); font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">🕐 TIME</div>
                          <div style="color:#FFFFFF; font-size:18px; font-weight:600;">${data.startTime} - ${data.endTime}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Location Row -->
                <tr>
                  <td style="padding:32px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
                    <div style="color:rgba(255,255,255,0.5); font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">📍 MEETING POINT</div>
                    <div style="color:#FFFFFF; font-size:16px; font-weight:500; line-height:1.6; margin-bottom:20px;">${data.stableAddress}</div>
                    ${directionsLink ? `
                    <a href="${directionsLink}" style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)); color:#FFFFFF; font-size:14px; font-weight:600; border-radius:100px; text-decoration:none; border:1px solid rgba(255,255,255,0.2); letter-spacing:0.05em;">
                      Get Directions →
                    </a>` : ''}
                  </td>
                </tr>
                
                <!-- Total Price -->
                <tr>
                  <td style="padding-top:32px; text-align:center;">
                    <div style="color:rgba(255,255,255,0.5); font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:12px;">TOTAL AMOUNT</div>
                    <div style="color:#FFFFFF; font-size:40px; font-weight:800; letter-spacing:-0.02em;">EGP ${data.totalPrice.toFixed(0)}</div>
                    <div style="color:rgba(255,255,255,0.4); font-size:12px; margin-top:8px;">Payment handled on arrival</div>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 40px 48px;">
              <a href="https://www.pyrarides.com/dashboard/rider" style="display:inline-block; padding:18px 48px; background:#FFFFFF; color:#000000; font-size:13px; font-weight:700; border-radius:100px; text-decoration:none; letter-spacing:0.1em; text-transform:uppercase; box-shadow:0 10px 30px rgba(255,255,255,0.2);">
                View My Bookings
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:rgba(255,255,255,0.02); padding:32px 40px; text-align:center; border-top:1px solid rgba(255,255,255,0.05);">
              <img src="${LOGO_URL}" alt="PyraRide" width="40" height="40" style="width:40px; height:40px; border-radius:50%; margin-bottom:16px; opacity:0.8;">
              <p style="margin:0 0 8px; color:rgba(255,255,255,0.6); font-size:13px;">
                <a href="https://www.pyrarides.com" style="color:rgba(255,255,255,0.8); text-decoration:none;">Website</a>  •  
                <a href="mailto:support@pyrarides.com" style="color:rgba(255,255,255,0.8); text-decoration:none;">Support</a>  •  
                <a href="https://instagram.com/pyrarides" style="color:rgba(255,255,255,0.8); text-decoration:none;">Instagram</a>
              </p>
              <p style="margin:0; color:rgba(255,255,255,0.3); font-size:11px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</p>
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
  const HERO_BG_URL = "https://www.pyrarides.com/hero-bg.webp";
  const LOGO_URL = "https://www.pyrarides.com/logo.png";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - PyraRide</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000; background-image:url('${HERO_BG_URL}'); background-size:cover; background-position:center; background-repeat:no-repeat;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background:rgba(20, 20, 20, 0.9); border:1px solid rgba(255,255,255,0.1); border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <tr>
            <td align="center" style="padding: 48px 40px 32px;">
              <div style="margin-bottom: 32px;">
                <img src="${LOGO_URL}" alt="PyraRide" width="80" height="80" style="width:80px; height:80px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); box-shadow:0 0 20px rgba(239,68,68,0.3); display:block;">
              </div>
              
              <div style="margin-bottom: 24px;">
                <span style="display:inline-block; padding:8px 16px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); border-radius:100px; color:#ef4444; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">Booking Cancelled</span>
              </div>

              <h1 style="margin:0 0 16px; color:#FFFFFF; font-size:36px; font-weight:700; letter-spacing:-0.02em; line-height:1.2;">Booking Cancelled</h1>
              <p style="margin:0; color:#9CA3AF; font-size:16px; line-height:1.6;">
                ${isOwnerCancelled ? "The stable owner has cancelled your booking." : "Your booking has been cancelled."}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td colspan="2" style="padding-bottom:24px;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:24px;">
                      <table width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="48" style="vertical-align:top; padding-right:16px;">
                            <div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #ef4444, #b91c1c); display:flex; align-items:center; justify-content:center; color:#FFFFFF;">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                            </div>
                          </td>
                          <td style="vertical-align:top;">
                            <div style="color:#6B7280; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">CANCELLED DETAILS</div>
                            <div style="color:#FFFFFF; font-size:16px; font-weight:600; margin-bottom:2px;">${data.horseName}</div>
                            <div style="color:#9CA3AF; font-size:14px;">${new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                            <div style="color:#9CA3AF; font-size:14px;">${data.startTime} - ${data.endTime}</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                ${data.cancellationReason ? `
                <tr>
                  <td colspan="2" style="padding-bottom:24px;">
                    <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:16px; padding:20px;">
                      <div style="color:#ef4444; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">REASON</div>
                      <div style="color:#FFFFFF; font-size:15px;">${data.cancellationReason}</div>
                    </div>
                  </td>
                </tr>
                ` : ''}

                ${isOwnerCancelled ? `
                <tr>
                  <td colspan="2">
                    <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); border-radius:16px; padding:20px;">
                      <div style="color:#3b82f6; font-size:13px; line-height:1.6;">
                        <strong>Refund Notice:</strong><br>
                        A full refund has been initiated. Please allow 5-7 business days for it to appear in your account.
                      </div>
                    </div>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.1); padding: 32px 40px; text-align:center;">
              <p style="margin:0 0 16px; color:#6B7280; font-size:13px;">
                <a href="https://www.pyrarides.com" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Website</a> • 
                <a href="mailto:support@pyrarides.com" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Support</a>
              </p>
              <p style="margin:0; color:#4B5563; font-size:12px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</p>
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 32px; opacity: 0.5;">
          <img src="${LOGO_URL}" alt="PyraRide" width="32" height="32" style="width:32px; height:32px; border-radius:50%; filter:grayscale(100%);">
        </div>

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
  const HERO_BG_URL = "https://www.pyrarides.com/hero-bg.webp";
  const LOGO_URL = "https://www.pyrarides.com/logo.png";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Rescheduled - PyraRide</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000; background-image:url('${HERO_BG_URL}'); background-size:cover; background-position:center; background-repeat:no-repeat;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background:rgba(20, 20, 20, 0.9); border:1px solid rgba(255,255,255,0.1); border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <tr>
            <td align="center" style="padding: 48px 40px 32px;">
              <div style="margin-bottom: 32px;">
                <img src="${LOGO_URL}" alt="PyraRide" width="80" height="80" style="width:80px; height:80px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); box-shadow:0 0 20px rgba(251,191,36,0.3); display:block;">
              </div>
              
              <div style="margin-bottom: 24px;">
                <span style="display:inline-block; padding:8px 16px; background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.3); border-radius:100px; color:#fbbf24; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">Booking Rescheduled</span>
              </div>

              <h1 style="margin:0 0 16px; color:#FFFFFF; font-size:36px; font-weight:700; letter-spacing:-0.02em; line-height:1.2;">New Time Confirmed</h1>
              <p style="margin:0; color:#9CA3AF; font-size:16px; line-height:1.6;">
                ${isOwnerRescheduled ? "The stable owner has rescheduled your booking." : "Your booking has been rescheduled."}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" style="padding-bottom:24px; padding-right:12px; vertical-align:top;">
                    <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:16px; padding:20px;">
                      <div style="color:#ef4444; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">OLD TIME</div>
                      <div style="color:#FFFFFF; font-size:14px; font-weight:600;">${new Date(data.oldDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div style="color:#ef4444; font-size:13px;">${data.oldStartTime} - ${data.oldEndTime}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-bottom:24px; padding-left:12px; vertical-align:top;">
                    <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); border-radius:16px; padding:20px;">
                      <div style="color:#10b981; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">NEW TIME</div>
                      <div style="color:#FFFFFF; font-size:14px; font-weight:600;">${new Date(data.newDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div style="color:#10b981; font-size:13px;">${data.newStartTime} - ${data.newEndTime}</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colspan="2">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:24px;">
                      <table width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="48" style="vertical-align:top; padding-right:16px;">
                            <div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #d4af37, #f59e0b); display:flex; align-items:center; justify-content:center; color:#FFFFFF;">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z"/></svg>
                            </div>
                          </td>
                          <td style="vertical-align:top;">
                            <div style="color:#6B7280; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">HORSE & STABLE</div>
                            <div style="color:#FFFFFF; font-size:16px; font-weight:600; margin-bottom:2px;">${data.horseName}</div>
                            <div style="color:#9CA3AF; font-size:14px;">${data.stableName}</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.1); padding: 32px 40px; text-align:center;">
              <p style="margin:0 0 16px; color:#6B7280; font-size:13px;">
                <a href="https://www.pyrarides.com" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Website</a> • 
                <a href="mailto:support@pyrarides.com" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Support</a>
              </p>
              <p style="margin:0; color:#4B5563; font-size:12px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</p>
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 32px; opacity: 0.5;">
          <img src="${LOGO_URL}" alt="PyraRide" width="32" height="32" style="width:32px; height:32px; border-radius:50%; filter:grayscale(100%);">
        </div>

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
  horseImage?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingId: string;
}

function generateOwnerBookingNotificationEmail(data: OwnerBookingNotificationData): string {
  // Use public URLs for images
  const HERO_BG_URL = "https://www.pyrarides.com/hero-bg.webp";
  const LOGO_URL = "https://www.pyrarides.com/logo.png";

  // Fallback for horse image if not provided
  const horseImage = data.horseImage || "https://www.pyrarides.com/og-image.jpg";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received - PyraRide</title>
  <!-- Import Inter font for premium look -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Main Background Container with Hero Image -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000; background-image:url('${HERO_BG_URL}'); background-size:cover; background-position:center; background-repeat:no-repeat;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        
        <!-- Glassmorphism Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background:rgba(20, 20, 20, 0.9); border:1px solid rgba(255,255,255,0.1); border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <!-- Header Section -->
          <tr>
            <td align="center" style="padding: 48px 40px 32px;">
              <!-- Circular Logo with Glow -->
              <div style="margin-bottom: 32px;">
                <img src="${LOGO_URL}" alt="PyraRide" width="80" height="80" style="width:80px; height:80px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); box-shadow:0 0 20px rgba(16,185,129,0.3); display:block;">
              </div>
              
              <!-- Success Indicator -->
              <div style="margin-bottom: 24px;">
                <span style="display:inline-block; padding:8px 16px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); border-radius:100px; color:#10b981; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">New Booking Confirmed</span>
              </div>

              <h1 style="margin:0 0 16px; color:#FFFFFF; font-size:36px; font-weight:700; letter-spacing:-0.02em; line-height:1.2;">Ride Scheduled! 🐎</h1>
              <p style="margin:0; color:#9CA3AF; font-size:16px; line-height:1.6;">A new rider is ready for an adventure at your stable.</p>
            </td>
          </tr>

          <!-- Horse Image Section -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); position:relative;">
                <img src="${horseImage}" alt="${data.horseName}" width="520" style="width:100%; height:auto; display:block; object-fit:cover; aspect-ratio:16/9;">
                <!-- Overlay Gradient -->
                <div style="position:absolute; bottom:0; left:0; right:0; height:50%; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);"></div>
                <!-- Horse Name on Image -->
                <div style="position:absolute; bottom:20px; left:20px;">
                  <h2 style="margin:0; color:#FFFFFF; font-size:24px; font-weight:700; text-shadow:0 2px 4px rgba(0,0,0,0.5);">${data.horseName}</h2>
                </div>
              </div>
            </td>
          </tr>

          <!-- Details Grid -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <!-- Row 1: Date & Time -->
                <tr>
                  <td width="50%" style="padding-bottom:24px; padding-right:12px; vertical-align:top;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px;">
                      <div style="color:#6B7280; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">DATE</div>
                      <div style="color:#FFFFFF; font-size:15px; font-weight:600;">${new Date(data.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-bottom:24px; padding-left:12px; vertical-align:top;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px;">
                      <div style="color:#6B7280; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">TIME</div>
                      <div style="color:#FFFFFF; font-size:15px; font-weight:600;">${data.startTime} - ${data.endTime}</div>
                    </div>
                  </td>
                </tr>

                <!-- Row 2: Rider Info -->
                <tr>
                  <td colspan="2" style="padding-bottom:24px;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:24px; display:flex; align-items:center;">
                      <table width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="48" style="vertical-align:middle; padding-right:16px;">
                            <div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #3b82f6, #06b6d4); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-weight:700; font-size:20px;">
                              ${data.riderName.charAt(0).toUpperCase()}
                            </div>
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="color:#6B7280; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">RIDER DETAILS</div>
                            <div style="color:#FFFFFF; font-size:16px; font-weight:600; margin-bottom:2px;">${data.riderName}</div>
                            <div style="color:#9CA3AF; font-size:14px;">${data.riderEmail}</div>
                            ${data.riderPhone ? `<div style="color:#10b981; font-size:13px; margin-top:4px; font-weight:500;">📞 ${data.riderPhone}</div>` : ''}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Row 3: Total Price -->
                <tr>
                  <td colspan="2">
                    <div style="background:linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05)); border:1px solid rgba(16,185,129,0.3); border-radius:16px; padding:24px; text-align:center;">
                      <div style="color:#10b981; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">TOTAL EARNINGS</div>
                      <div style="color:#FFFFFF; font-size:32px; font-weight:800; letter-spacing:-0.02em;">EGP ${data.totalPrice}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding: 0 40px 48px;">
              <a href="${process.env.NEXTAUTH_URL || 'https://www.pyrarides.com'}/dashboard/stable" style="display:inline-block; padding:18px 48px; background:linear-gradient(90deg, #0d9488, #2563eb); color:#FFFFFF; font-size:16px; font-weight:600; border-radius:100px; text-decoration:none; box-shadow:0 10px 25px -5px rgba(37,99,235,0.5); transition:transform 0.2s;">
                Open Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.1); padding: 32px 40px; text-align:center;">
              <p style="margin:0 0 16px; color:#6B7280; font-size:13px;">
                <a href="https://www.pyrarides.com" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Website</a> • 
                <a href="mailto:support@pyrarides.com" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Support</a> • 
                <a href="#" style="color:#9CA3AF; text-decoration:none; margin:0 10px;">Terms</a>
              </p>
              <p style="margin:0; color:#4B5563; font-size:12px;">© ${new Date().getFullYear()} PyraRide. All rights reserved.</p>
            </td>
          </tr>

        </table>
        
        <!-- Bottom Branding -->
        <div style="margin-top: 32px; opacity: 0.5;">
          <img src="${LOGO_URL}" alt="PyraRide" width="32" height="32" style="width:32px; height:32px; border-radius:50%; filter:grayscale(100%);">
        </div>

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
        from: "PyraRides <pyrarides@pyrarides.com>",
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


