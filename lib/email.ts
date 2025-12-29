import nodemailer from "nodemailer";
import { Resend } from "resend";

// Initialize Resend for fast email delivery
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// PyraRide Brand URLs
const LOGO_URL = "https://www.pyrarides.com/logo.png";
const HERO_BG_URL = "https://www.pyrarides.com/hero-bg.webp";

interface BookingEmailData {
  bookingId: string;
  riderName: string;
  riderEmail: string;
  stableName: string;
  stableAddress: string;
  horseName: string;
  horseImage?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  riders: number;
}

// Create reusable transporter
function createTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("Email configuration not set. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// ============================================================================
// MASTER EMAIL TEMPLATE - Matches Tinker Watches Minimal Dark Style
// ============================================================================
function generateEmailTemplate({
  headline,
  subheadline,
  imageUrl,
  imageAlt,
  bodyTitle,
  bodyText,
  details,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  headline: string;
  subheadline?: string;
  imageUrl?: string;
  imageAlt?: string;
  bodyTitle: string;
  bodyText: string;
  details?: { label: string; value: string }[];
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const detailsHtml = details
    ? details
      .map(
        (d) => `
        <tr>
          <td style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
            <span style="color:rgba(255,255,255,0.5); font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">${d.label}</span><br>
            <span style="color:#FFFFFF; font-size:16px; font-weight:500;">${d.value}</span>
          </td>
        </tr>
      `
      )
      .join("")
    : "";

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${headline} - PyraRide</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: dark;
      supported-color-schemes: dark;
    }
    body {
      background-color: #000000 !important;
      color: #ffffff !important;
    }
    .dark-mode-bg {
      background-color: #000000 !important;
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#000000; color:#ffffff; font-family:'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Outlook Background Fix -->
  <!--[if mso]>
  <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
    <v:fill type="tile" color="#000000"/>
  </v:background>
  <![endif]-->

  <!-- Main Wrapper Div -->
  <div style="background-color:#000000; background-image:linear-gradient(#000000,#000000); width:100%; height:100%;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color:#000000; width:100%; margin:0; padding:0;">
      <tr>
        <td align="center" valign="top" style="padding:0; background-color:#000000;">
          
          <!-- Content Container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px; width:100%; background-color:#000000; margin:0 auto;">
            
            <!-- Header -->
            <tr>
              <td style="padding:40px 40px 20px; border-bottom:1px solid rgba(255,255,255,0.1);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family:'Inter', sans-serif; font-size:14px; font-weight:600; letter-spacing:0.3em; color:#FFFFFF; text-transform:uppercase;">
                    PYRARIDE
                  </td>
                  <td align="right" style="font-family:'Inter', sans-serif; font-size:11px; color:rgba(255,255,255,0.5); letter-spacing:0.05em;">
                    ${subheadline || "Book Your Adventure"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Headline -->
          <tr>
            <td style="padding:60px 40px 40px;">
              <h1 style="margin:0; font-family:'Playfair Display', serif; font-size:48px; font-weight:400; line-height:1.1; color:#FFFFFF;">
                ${headline.replace(/\n/g, '<br>')}
              </h1>
            </td>
          </tr>
          
          ${imageUrl
      ? `
          <!-- Hero Image -->
          <tr>
            <td style="padding:0 40px 40px;">
              <img src="${imageUrl}" alt="${imageAlt || "PyraRide"}" width="520" style="width:100%; height:auto; display:block; border-radius:4px;" />
            </td>
          </tr>
          `
      : ""
    }
          
          <!-- Body Content -->
          <tr>
            <td style="padding:0 40px 40px;">
              <h2 style="margin:0 0 16px; font-family:'Playfair Display', serif; font-size:24px; font-weight:500; color:#FFFFFF; text-align:center;">
                ${bodyTitle}
              </h2>
              <p style="margin:0; font-family:'Inter', sans-serif; font-size:14px; line-height:1.7; color:rgba(255,255,255,0.7); text-align:center;">
                ${bodyText}
              </p>
            </td>
          </tr>
          
          ${details && details.length > 0
      ? `
          <!-- Details Section -->
          <tr>
            <td style="padding:0 40px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:rgba(255,255,255,0.03); border-radius:8px; padding:24px;">
                ${detailsHtml}
              </table>
            </td>
          </tr>
          `
      : ""
    }
          
          ${ctaText && ctaUrl
      ? `
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 40px 60px;">
              <a href="${ctaUrl}" style="display:inline-block; padding:16px 48px; background:#FFFFFF; color:#000000; font-family:'Inter', sans-serif; font-size:12px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; border-radius:0;">
                ${ctaText}
              </a>
            </td>
          </tr>
          `
      : ""
    }
          
          <!-- Social Icons -->
          <tr>
            <td align="center" style="padding:40px 40px 30px; border-top:1px solid rgba(255,255,255,0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 12px;">
                    <a href="https://instagram.com/pyrarides" style="color:#FFFFFF; text-decoration:none; font-size:18px;">📷</a>
                  </td>
                  <td style="padding:0 12px;">
                    <a href="https://tiktok.com/@pyrarides" style="color:#FFFFFF; text-decoration:none; font-size:18px;">🎵</a>
                  </td>
                  <td style="padding:0 12px;">
                    <a href="https://www.pyrarides.com" style="color:#FFFFFF; text-decoration:none; font-size:18px;">🌐</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0 0 8px; font-family:'Inter', sans-serif; font-size:11px; color:rgba(255,255,255,0.4); text-align:center;">
                Copyright © ${new Date().getFullYear()} PyraRide. All rights reserved.
              </p>
              <p style="margin:0 0 8px; font-family:'Inter', sans-serif; font-size:11px; color:rgba(255,255,255,0.3); text-align:center;">
                You're receiving this because you booked a ride on pyrarides.com
              </p>
              ${footerNote
      ? `<p style="margin:0; font-family:'Inter', sans-serif; font-size:11px; color:rgba(255,255,255,0.3); text-align:center;">${footerNote}</p>`
      : ""
    }
              <p style="margin:16px 0 0; font-family:'Inter', sans-serif; font-size:11px; text-align:center;">
                <a href="mailto:support@pyrarides.com" style="color:rgba(255,255,255,0.5); text-decoration:underline;">Contact Support</a>
              </p>
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

// ============================================================================
// BOOKING CONFIRMATION EMAIL (Rider)
// ============================================================================
function generateBookingConfirmationEmail(data: BookingEmailData): string {
  const directionsLink = data.stableAddress
    ? `https://maps.google.com/?daddr=${encodeURIComponent(data.stableAddress)}`
    : "";

  return generateEmailTemplate({
    headline: "Your Ride\nAwaits.",
    subheadline: "Booking Confirmed",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: "Booking Confirmed",
    bodyText: `Get ready for an unforgettable adventure at the Giza Pyramids. Your trusted horse ${data.horseName} is waiting for you at ${data.stableName}.`,
    details: [
      { label: "Horse", value: data.horseName },
      { label: "Stable", value: data.stableName },
      { label: "Date", value: new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
      { label: "Time", value: `${data.startTime} - ${data.endTime}` },
      { label: "Meeting Point", value: data.stableAddress },
      { label: "Total", value: `EGP ${data.totalPrice.toFixed(0)}` },
    ],
    ctaText: "Get Directions",
    ctaUrl: directionsLink || "https://www.pyrarides.com",
    footerNote: "Payment is collected on arrival.",
  });
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
      subject: `🐴 Booking Confirmed - ${data.horseName} at ${data.stableName}`,
      html: generateBookingConfirmationEmail(data),
      text: `Booking Confirmed!\n\nYour booking at ${data.stableName} has been confirmed.\n\nHorse: ${data.horseName}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}\nTotal: EGP ${data.totalPrice.toFixed(0)}\n\nThank you for choosing PyraRide!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return false;
  }
}

// ============================================================================
// PASSWORD RESET EMAIL
// ============================================================================
interface PasswordResetEmailData {
  email: string;
  fullName: string;
  resetLink: string;
}

function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  return generateEmailTemplate({
    headline: "Reset Your\nPassword.",
    subheadline: "Security Update",
    bodyTitle: "Password Reset Requested",
    bodyText: `Hi ${data.fullName}, we received a request to reset your password. Click the button below to choose a new password. This link will expire in 60 minutes for security reasons.`,
    ctaText: "Reset Password",
    ctaUrl: data.resetLink,
    footerNote: "If you didn't request this, you can safely ignore this email.",
  });
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
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

// ============================================================================
// BOOKING CANCELLATION EMAIL (Rider)
// ============================================================================
interface BookingCancellationEmailData {
  bookingId: string;
  riderName: string;
  riderEmail: string;
  stableName: string;
  horseName: string;
  horseImage?: string;
  date: string;
  startTime: string;
  endTime: string;
  cancellationReason?: string;
  cancelledBy: "rider" | "owner" | "admin";
}

function generateBookingCancellationEmail(data: BookingCancellationEmailData): string {
  const isOwnerCancelled = data.cancelledBy === "owner";

  return generateEmailTemplate({
    headline: "Booking\nCancelled.",
    subheadline: isOwnerCancelled ? "Cancelled by Stable" : "Cancellation Confirmed",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: isOwnerCancelled ? "The stable owner has cancelled your booking" : "Your booking has been cancelled",
    bodyText: isOwnerCancelled
      ? `We're sorry, but the stable owner has cancelled your booking for ${data.horseName}. ${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ""} A full refund will be processed automatically if you made a payment.`
      : `Your booking for ${data.horseName} at ${data.stableName} has been cancelled. We hope to see you on another adventure soon!`,
    details: [
      { label: "Horse", value: data.horseName },
      { label: "Stable", value: data.stableName },
      { label: "Original Date", value: new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
      { label: "Original Time", value: `${data.startTime} - ${data.endTime}` },
    ],
    ctaText: "Book Another Ride",
    ctaUrl: "https://www.pyrarides.com/stables",
    footerNote: isOwnerCancelled ? "Refunds take 5-7 business days to process." : undefined,
  });
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
      text: `${data.cancelledBy === "owner" ? "The stable owner has cancelled your booking" : "Your booking has been cancelled"} at ${data.stableName}.\n\nHorse: ${data.horseName}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Cancellation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return false;
  }
}

// ============================================================================
// BOOKING RESCHEDULE EMAIL (Rider)
// ============================================================================
interface BookingRescheduleEmailData {
  bookingId: string;
  riderName: string;
  riderEmail: string;
  stableName: string;
  horseName: string;
  horseImage?: string;
  oldDate: string;
  oldStartTime: string;
  oldEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  rescheduledBy: "rider" | "owner" | "admin";
}

function generateBookingRescheduleEmail(data: BookingRescheduleEmailData): string {
  const isOwnerRescheduled = data.rescheduledBy === "owner";

  return generateEmailTemplate({
    headline: "New Time\nConfirmed.",
    subheadline: isOwnerRescheduled ? "Rescheduled by Stable" : "Booking Rescheduled",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: isOwnerRescheduled ? "The stable has rescheduled your booking" : "Your booking has been rescheduled",
    bodyText: `Your ride with ${data.horseName} has been moved to a new time. Please note the updated schedule below.`,
    details: [
      { label: "Horse", value: data.horseName },
      { label: "Stable", value: data.stableName },
      { label: "New Date", value: new Date(data.newDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
      { label: "New Time", value: `${data.newStartTime} - ${data.newEndTime}` },
      { label: "Previous Date", value: new Date(data.oldDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) },
      { label: "Previous Time", value: `${data.oldStartTime} - ${data.oldEndTime}` },
    ],
    ctaText: "View My Bookings",
    ctaUrl: "https://www.pyrarides.com/dashboard/rider",
  });
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
      text: `Your booking has been rescheduled.\n\nNew Date: ${data.newDate}\nNew Time: ${data.newStartTime} - ${data.newEndTime}\nHorse: ${data.horseName}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reschedule email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reschedule email:", error);
    return false;
  }
}

// ============================================================================
// OWNER BOOKING NOTIFICATION EMAIL
// ============================================================================
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
  return generateEmailTemplate({
    headline: "New Booking\nReceived.",
    subheadline: "Stable Owner Alert",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: `${data.riderName} has booked a ride`,
    bodyText: `Great news! A new rider has booked ${data.horseName} for an adventure at the Pyramids. Here are the details.`,
    details: [
      { label: "Rider Name", value: data.riderName },
      { label: "Rider Email", value: data.riderEmail },
      { label: "Rider Phone", value: data.riderPhone || "Not provided" },
      { label: "Horse", value: data.horseName },
      { label: "Date", value: new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
      { label: "Time", value: `${data.startTime} - ${data.endTime}` },
      { label: "Earnings", value: `EGP ${data.totalPrice.toFixed(0)}` },
    ],
    ctaText: "Open Dashboard",
    ctaUrl: `${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}/dashboard/stable`,
  });
}

export async function sendOwnerBookingNotification(data: OwnerBookingNotificationData): Promise<boolean> {
  const subject = `🐴 New Booking: ${data.horseName} - ${new Date(data.date).toLocaleDateString()}`;
  const html = generateOwnerBookingNotificationEmail(data);
  const text = `New Booking Received!\n\nHorse: ${data.horseName}\nRider: ${data.riderName}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}\nTotal: EGP ${data.totalPrice}`;

  // Try Resend first
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

    const info = await transporter.sendMail({
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.ownerEmail,
      subject,
      html,
      text,
    });

    console.log("Owner notification sent via Nodemailer:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending owner notification:", error);
    return false;
  }
}

// ============================================================================
// OWNER CANCELLATION NOTIFICATION EMAIL
// ============================================================================
interface OwnerCancellationNotificationData {
  ownerEmail: string;
  riderName: string;
  riderEmail: string;
  horseName: string;
  horseImage?: string;
  date: string;
  startTime: string;
  endTime: string;
  cancellationReason?: string;
  cancelledBy: "rider" | "owner" | "admin";
}

function generateOwnerCancellationEmail(data: OwnerCancellationNotificationData): string {
  const isRiderCancelled = data.cancelledBy === "rider";

  return generateEmailTemplate({
    headline: "Booking\nCancelled.",
    subheadline: isRiderCancelled ? "Cancelled by Rider" : "Cancellation Confirmed",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: isRiderCancelled ? `${data.riderName} has cancelled their booking` : "You have cancelled this booking",
    bodyText: isRiderCancelled
      ? `The rider has cancelled their booking for ${data.horseName}. The time slot is now available for other riders.`
      : `You have successfully cancelled the booking for ${data.horseName}. ${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ""}`,
    details: [
      { label: "Rider Name", value: data.riderName },
      { label: "Rider Email", value: data.riderEmail },
      { label: "Horse", value: data.horseName },
      { label: "Original Date", value: new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
      { label: "Original Time", value: `${data.startTime} - ${data.endTime}` },
    ],
    ctaText: "Open Dashboard",
    ctaUrl: `${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}/dashboard/stable`,
  });
}

export async function sendOwnerCancellationNotification(data: OwnerCancellationNotificationData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const isRiderCancelled = data.cancelledBy === "rider";
    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.ownerEmail,
      subject: isRiderCancelled
        ? `❌ Booking Cancelled by Rider - ${data.horseName}`
        : `✓ Cancellation Confirmed - ${data.horseName}`,
      html: generateOwnerCancellationEmail(data),
      text: `Booking Cancelled\n\nHorse: ${data.horseName}\nRider: ${data.riderName}\nDate: ${data.date}\nTime: ${data.startTime} - ${data.endTime}\nCancelled by: ${data.cancelledBy}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Owner cancellation notification sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending owner cancellation notification:", error);
    return false;
  }
}

// ============================================================================
// OWNER RESCHEDULE NOTIFICATION EMAIL
// ============================================================================
interface OwnerRescheduleNotificationData {
  ownerEmail: string;
  riderName: string;
  riderEmail: string;
  horseName: string;
  horseImage?: string;
  oldDate: string;
  oldStartTime: string;
  oldEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  rescheduledBy: "rider" | "owner" | "admin";
}

function generateOwnerRescheduleEmail(data: OwnerRescheduleNotificationData): string {
  const isRiderRescheduled = data.rescheduledBy === "rider";

  return generateEmailTemplate({
    headline: "Booking\nRescheduled.",
    subheadline: isRiderRescheduled ? "Rescheduled by Rider" : "Reschedule Confirmed",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: isRiderRescheduled ? `${data.riderName} has rescheduled their booking` : "You have rescheduled this booking",
    bodyText: isRiderRescheduled
      ? `The rider has moved their booking for ${data.horseName} to a new time. Please note the updated schedule below.`
      : `You have successfully rescheduled the booking for ${data.horseName}. The rider has been notified.`,
    details: [
      { label: "Rider Name", value: data.riderName },
      { label: "Rider Email", value: data.riderEmail },
      { label: "Horse", value: data.horseName },
      { label: "New Date", value: new Date(data.newDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
      { label: "New Time", value: `${data.newStartTime} - ${data.newEndTime}` },
      { label: "Previous Date", value: new Date(data.oldDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) },
      { label: "Previous Time", value: `${data.oldStartTime} - ${data.oldEndTime}` },
    ],
    ctaText: "Open Dashboard",
    ctaUrl: `${process.env.NEXTAUTH_URL || "https://www.pyrarides.com"}/dashboard/stable`,
  });
}

export async function sendOwnerRescheduleNotification(data: OwnerRescheduleNotificationData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const isRiderRescheduled = data.rescheduledBy === "rider";
    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.ownerEmail,
      subject: isRiderRescheduled
        ? `🔄 Booking Rescheduled by Rider - ${data.horseName}`
        : `✓ Reschedule Confirmed - ${data.horseName}`,
      html: generateOwnerRescheduleEmail(data),
      text: `Booking Rescheduled\n\nHorse: ${data.horseName}\nRider: ${data.riderName}\nNew Date: ${data.newDate}\nNew Time: ${data.newStartTime} - ${data.newEndTime}\nRescheduled by: ${data.rescheduledBy}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Owner reschedule notification sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending owner reschedule notification:", error);
    return false;
  }
}

// ============================================================================
// BOOKING REMINDER EMAIL (5 hours before ride)
// ============================================================================
interface BookingReminderEmailData {
  riderName: string;
  riderEmail: string;
  stableName: string;
  stableAddress: string;
  horseName: string;
  horseImage?: string;
  date: string;
  startTime: string;
  endTime: string;
}

function generateBookingReminderEmail(data: BookingReminderEmailData): string {
  const directionsLink = data.stableAddress
    ? `https://maps.google.com/?daddr=${encodeURIComponent(data.stableAddress)}`
    : "";

  return generateEmailTemplate({
    headline: "Your Ride Is\nToday.",
    subheadline: "Reminder",
    imageUrl: data.horseImage || HERO_BG_URL,
    imageAlt: data.horseName,
    bodyTitle: `${data.horseName} is waiting for you!`,
    bodyText: `Hi ${data.riderName}, just a friendly reminder that your adventure at the Giza Pyramids is happening today. Please arrive 15 minutes early.`,
    details: [
      { label: "Horse", value: data.horseName },
      { label: "Stable", value: data.stableName },
      { label: "Time", value: `${data.startTime} - ${data.endTime}` },
      { label: "Meeting Point", value: data.stableAddress },
    ],
    ctaText: "Get Directions",
    ctaUrl: directionsLink || "https://www.pyrarides.com",
    footerNote: "Bring sunscreen, comfortable shoes, and your sense of adventure!",
  });
}

export async function sendBookingReminderEmail(data: BookingReminderEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email send.");
      return false;
    }

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.riderEmail,
      subject: `⏰ Reminder: Your ride with ${data.horseName} is today!`,
      html: generateBookingReminderEmail(data),
      text: `Reminder: Your ride is today!\n\nHorse: ${data.horseName}\nStable: ${data.stableName}\nTime: ${data.startTime} - ${data.endTime}\nLocation: ${data.stableAddress}\n\nSee you soon!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reminder email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}

// ============================================================================
// GENERIC EMAIL SENDING
// ============================================================================
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

// ============================================================================
// NEW FOLLOWER NOTIFICATION EMAIL
// ============================================================================
interface NewFollowerEmailData {
  followedEmail: string;
  followedName: string;
  followerName: string;
  followerProfileUrl: string;
}

function generateNewFollowerEmail(data: NewFollowerEmailData): string {
  return generateEmailTemplate({
    headline: "New Follower.",
    subheadline: "Community Update",
    bodyTitle: `${data.followerName} started following you`,
    bodyText: `You have a new follower on PyraRide! ${data.followerName} is now following your adventures.`,
    ctaText: "View Profile",
    ctaUrl: data.followerProfileUrl,
    footerNote: "Connect with more riders to share your experiences.",
  });
}

export async function sendNewFollowerEmail(data: NewFollowerEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const mailOptions = {
      from: `"PyraRide" <${process.env.EMAIL_USER}>`,
      to: data.followedEmail,
      subject: `👤 New Follower: ${data.followerName}`,
      html: generateNewFollowerEmail(data),
      text: `${data.followerName} started following you on PyraRide.`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending new follower email:", error);
    return false;
  }
}
