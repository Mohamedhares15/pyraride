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
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - PyraRide</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Green Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px; color: #ffffff;">✓</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Booking Confirmed
                    </h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                      Your adventure is booked and ready!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Booking Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    
                    <!-- Date & Time -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-right: 16px; vertical-align: top;">
                          <div style="width: 48px; height: 48px; background-color: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">📅</span>
                          </div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Date & Time
                          </p>
                          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #111827;">
                            ${new Date(data.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            ${data.startTime} - ${data.endTime}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Horse Information -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-right: 16px; vertical-align: top;">
                          <div style="width: 48px; height: 48px; background-color: #8b5cf6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">👥</span>
                          </div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Horse Information
                          </p>
                          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #111827;">
                            ${data.horseName}
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            ${data.riders} ${data.riders === 1 ? "rider" : "riders"}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Location -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding-right: 16px; vertical-align: top;">
                          <div style="width: 48px; height: 48px; background-color: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">📍</span>
                          </div>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Location
                          </p>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                            ${data.stableName}
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                            ${data.stableAddress}
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Payment Info Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">
                            💳 Total Amount
                          </p>
                          <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e40af;">
                            $${data.totalPrice.toFixed(2)}
                          </p>
                          <p style="margin: 0; font-size: 13px; color: #1e3a8a;">
                            Payment will be processed on-site or via your preferred method
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booking Reference -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Booking Reference
                    </p>
                    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #111827;">
                      ${data.bookingId}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${process.env.NEXTAUTH_URL || "https://pyraride.vercel.app"}/dashboard/rider" 
                       style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View My Bookings →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                Thank you for choosing <strong style="color: #059669;">PyraRide</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                If you have any questions, please contact us at support@pyraride.com
              </p>
              <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af;">
                © ${new Date().getFullYear()} PyraRide. All rights reserved.
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

