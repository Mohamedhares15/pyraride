import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL =
  process.env.PARTNER_NOTIFY_EMAIL || "admin@pyrarides.com";

// ── Zod Schema ──────────────────────────────────────────────────────────
const partnerSchema = z.object({
  // Step 1 — Identity
  stableName: z.string().min(2, "Stable name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  whatsapp: z.string().min(8, "Valid WhatsApp number required"),
  googleMapsLink: z.string().url("Must be a valid URL"),
  socialLink: z.string().optional(),

  // Step 2 — Standards
  horseCount: z.coerce.number().min(1, "At least 1 horse"),
  horseTypes: z.string().min(2, "Please specify horse types"),
  restPeriods: z.enum(["yes", "no"]),
  guideType: z.string().min(2, "Please specify guide type"),
  languages: z.string().min(2, "Please specify languages"),

  // Step 3 — Facilities
  cleanRestrooms: z.boolean().default(false),
  waitingArea: z.boolean().default(false),
  safetyHelmets: z.boolean().default(false),
  photographySupport: z.boolean().default(false),
  cancellationPolicy: z.string().min(5, "Please describe your cancellation policy"),

  // Step 4 — Pricing
  standardRate: z.coerce.number().min(1, "Enter your standard rate"),
  exclusiveRate: z.coerce.number().min(1, "Enter your exclusive rate"),
  weeklyVolume: z.string().min(1, "Enter weekly ride volume"),

  // Step 5 — Final
  uniqueStrength: z.string().optional(),
});

type PartnerApplication = z.infer<typeof partnerSchema>;

// ── Email HTML Builder ──────────────────────────────────────────────────
function buildApplicationEmail(d: PartnerApplication): string {
  const facilities = [
    d.cleanRestrooms && "✅ Clean Restrooms",
    d.waitingArea && "✅ Waiting Area",
    d.safetyHelmets && "✅ Safety Helmets",
    d.photographySupport && "✅ Photography Support",
  ].filter(Boolean).join(" &nbsp;|&nbsp; ") || "❌ None selected";

  const discount =
    d.standardRate > 0
      ? Math.round(((d.standardRate - d.exclusiveRate) / d.standardRate) * 100)
      : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>New Partner Application — ${d.stableName}</title>
</head>
<body style="margin:0;padding:0;background:#000;color:#fff;font-family:'Inter',-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#000;">
    <tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#000;">

        <!-- Header -->
        <tr><td style="padding:40px 32px 24px;border-bottom:1px solid rgba(255,255,255,.1);">
          <table width="100%"><tr>
            <td style="font-size:13px;font-weight:700;letter-spacing:.3em;color:#DAA520;text-transform:uppercase;">PYRARIDES — PARTNER APPLICATION</td>
            <td align="right" style="font-size:11px;color:rgba(255,255,255,.4);">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
          </tr></table>
        </td></tr>

        <!-- Section: Identity -->
        <tr><td style="padding:32px 32px 0;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#DAA520;font-weight:600;letter-spacing:.05em;text-transform:uppercase;">1. IDENTITY & PRIDE</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,.04);border-radius:8px;padding:20px;">
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Stable Name</span><br>
              <span style="color:#fff;font-size:16px;font-weight:600;">${d.stableName}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Owner Name</span><br>
              <span style="color:#fff;font-size:15px;">${d.ownerName}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">WhatsApp</span><br>
              <span style="color:#fff;font-size:15px;">${d.whatsapp}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Google Maps</span><br>
              <a href="${d.googleMapsLink}" style="color:#DAA520;font-size:14px;word-break:break-all;">${d.googleMapsLink}</a>
            </td></tr>
            ${d.socialLink ? `<tr><td style="padding:10px 16px;">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Social</span><br>
              <a href="${d.socialLink}" style="color:#DAA520;font-size:14px;word-break:break-all;">${d.socialLink}</a>
            </td></tr>` : ""}
          </table>
        </td></tr>

        <!-- Section: Quality & Standards -->
        <tr><td style="padding:32px 32px 0;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#DAA520;font-weight:600;letter-spacing:.05em;text-transform:uppercase;">2. QUALITY & STANDARDS</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,.04);border-radius:8px;padding:20px;">
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Active Horses</span><br>
              <span style="color:#fff;font-size:22px;font-weight:700;">${d.horseCount}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Horse Types</span><br>
              <span style="color:#fff;font-size:15px;">${d.horseTypes}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Rest Periods Between Rides?</span><br>
              <span style="color:${d.restPeriods === "yes" ? "#22c55e" : "#ef4444"};font-size:15px;font-weight:600;">${d.restPeriods === "yes" ? "✅ YES" : "❌ NO"}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Guide Type</span><br>
              <span style="color:#fff;font-size:15px;">${d.guideType}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Languages</span><br>
              <span style="color:#fff;font-size:15px;">${d.languages}</span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Section: Facilities -->
        <tr><td style="padding:32px 32px 0;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#DAA520;font-weight:600;letter-spacing:.05em;text-transform:uppercase;">3. FACILITIES & SAFETY</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,.04);border-radius:8px;padding:20px;">
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Amenities</span><br>
              <span style="color:#fff;font-size:14px;">${facilities}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">24hr Cancellation Policy</span><br>
              <span style="color:#fff;font-size:14px;line-height:1.6;">${d.cancellationPolicy}</span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Section: Pricing -->
        <tr><td style="padding:32px 32px 0;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#DAA520;font-weight:600;letter-spacing:.05em;text-transform:uppercase;">4. PRICING & PARTNERSHIP</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(218,165,32,.06);border:1px solid rgba(218,165,32,.15);border-radius:8px;padding:20px;">
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Standard 1hr Rate</span><br>
              <span style="color:#fff;font-size:20px;font-weight:700;">EGP ${d.standardRate}</span>
            </td></tr>
            <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Exclusive PyraRides Rate</span><br>
              <span style="color:#DAA520;font-size:20px;font-weight:700;">EGP ${d.exclusiveRate}</span>
              <span style="color:rgba(255,255,255,.4);font-size:13px;margin-left:8px;">(${discount}% discount)</span>
            </td></tr>
            <tr><td style="padding:10px 16px;">
              <span style="color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">Weekly Volume (Peak)</span><br>
              <span style="color:#fff;font-size:15px;">${d.weeklyVolume}</span>
            </td></tr>
          </table>
        </td></tr>

        ${d.uniqueStrength ? `
        <!-- Section: Final Thoughts -->
        <tr><td style="padding:32px 32px 0;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#DAA520;font-weight:600;letter-spacing:.05em;text-transform:uppercase;">5. WHY THEY THINK THEY'RE A FIT</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,.04);border-radius:8px;padding:20px;">
            <tr><td style="padding:10px 16px;">
              <span style="color:#fff;font-size:14px;line-height:1.7;font-style:italic;">"${d.uniqueStrength}"</span>
            </td></tr>
          </table>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr><td style="padding:40px 32px;border-top:1px solid rgba(255,255,255,.08);margin-top:32px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);text-align:center;">
            This application was submitted via pyrarides.com/join
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── POST Handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = partnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const html = buildApplicationEmail(data);
    const subject = `🏇 New Partner Application: ${data.stableName} — ${data.ownerName}`;

    if (!resend) {
      console.error("Resend not configured — RESEND_API_KEY missing");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "PyraRides <pyrarides@pyrarides.com>",
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Partner API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
