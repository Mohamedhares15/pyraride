import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL =
  process.env.PARTNER_NOTIFY_EMAIL || "admin@pyrarides.com";

// ── Zod Schema ──────────────────────────────────────────────────────────
const horseSchema = z.object({
  name: z.string().min(1),
  sire: z.string().optional().or(z.literal("")),
  dam: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  walkinRate: z.coerce.number().optional(),
  pyraRate: z.coerce.number().optional(),
});

const partnerSchema = z.object({
  stableName: z.string().min(2),
  ownerName: z.string().min(2),
  whatsapp: z.string().min(8),
  googleMapsLink: z.string().url(),
  socialLink: z.string().optional(),
  horses: z.array(horseSchema).min(1).max(5),
  registry: z.string(),
  ageRange: z.string(),
  coatColors: z.array(z.string()),
  groomingFreq: z.string(),
  decorativeTack: z.string(),
  saddleTypes: z.array(z.string()),
  stirrupReplacement: z.string(),
  adjustableStirrups: z.string(),
  vetFrequency: z.string(),
  farrierSchedule: z.string(),
  vaccination: z.string(),
  lamenessProtocol: z.string(),
  insurance: z.string(),
  fallProtocol: z.string(),
  safetyBriefing: z.string(),
  maxWeight: z.coerce.number(),
  cleanRestrooms: z.boolean().default(false),
  waitingArea: z.boolean().default(false),
  safetyHelmets: z.boolean().default(false),
  photographySupport: z.boolean().default(false),
  refreshments: z.boolean().default(false),
  disabilityAccess: z.string(),
  cancellationPolicy: z.string(),
  routes: z.string(),
  nervousRider: z.string(),
  operatingHours: z.string(),
  groupCapacity: z.coerce.number(),
  backupHorse: z.string(),
  walkinPriority: z.string(),
  weeklyVolume: z.string(),
  revenueOnline: z.string(),
  paymentCycle: z.string(),
  exclusivePackage: z.string(),
  whyFit: z.string().optional(),
});

type PartnerApp = z.infer<typeof partnerSchema>;

// ── Skill label map ─────────────────────────────────────────────────────
const SKILL_LABELS: Record<string, string> = {
  dancing: "🐴 Dancing / رقص",
  rearing: "🐴 Rearing / تكبيش",
  lionSit: "🐴 Lion Sit / قعدة الأسد",
  jumping: "🐴 Jumping / نط",
};

// ── Helpers ──────────────────────────────────────────────────────────────
function yesNo(v: string | boolean): string {
  if (typeof v === "boolean") return v ? "✅ Yes" : "❌ No";
  const map: Record<string, string> = {
    yes: "✅ Yes", no: "❌ No", some: "⚠️ Some", always: "✅ Always",
    sometimes: "⚠️ Sometimes", onRequest: "On Request", inProgress: "🔄 In Progress",
    yesRecords: "✅ Yes (with records)", yesNoRecords: "⚠️ Yes (no records)",
    needDiscuss: "💬 Need to discuss", maybe: "🤔 Maybe",
    weekly: "Weekly", biweekly: "Bi-weekly", monthly: "Monthly",
    onlyWhenNeeded: "⚠️ Only when needed",
    "4-6weeks": "Every 4-6 weeks", "8weeks": "Every 8 weeks", irregular: "⚠️ Irregularly",
    quarterly: "Quarterly", annually: "Annually", whenBroken: "⚠️ When broken",
    usually: "Usually",
  };
  return map[v] || v;
}

function facLabel(items: [boolean, string][]): string {
  const on = items.filter(([v]) => v).map(([, l]) => `✅ ${l}`);
  return on.length > 0 ? on.join(" &nbsp;|&nbsp; ") : "❌ None selected";
}

// ── Section HTML builder ────────────────────────────────────────────────
function section(title: string, rows: { label: string; value: string }[]): string {
  return `
    <tr><td style="padding:28px 32px 0;">
      <h2 style="margin:0 0 14px;font-size:16px;color:#DAA520;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">${title}</h2>
      <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,.04);border-radius:8px;padding:16px;">
        ${(rows || []).map((r) => `
          <tr><td style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.05);">
            <span style="color:rgba(255,255,255,.45);font-size:11px;text-transform:uppercase;letter-spacing:.1em;">${r.label}</span><br>
            <span style="color:#fff;font-size:14px;">${r.value}</span>
          </td></tr>
        `).join("")}
      </table>
    </td></tr>`;
}

// ── Email Builder ───────────────────────────────────────────────────────
function buildEmail(d: PartnerApp): string {
  const facilities = facLabel([
    [d.cleanRestrooms, "Clean Restrooms"],
    [d.waitingArea, "Waiting Area"],
    [d.safetyHelmets, "Safety Helmets"],
    [d.photographySupport, "Photography/Video"],
    [d.refreshments, "Refreshments"],
  ]);

  // Per-horse pricing table
  const namedHorses = d.horses.filter((h) => h.name?.trim());
  const horsePricingRows = (namedHorses || []).map((h) => {
    const skills = (h.skills || []).map((s) => SKILL_LABELS[s] || s).join(", ") || "—";
    const walkin = h.walkinRate ? `EGP ${h.walkinRate}` : "—";
    const pyra = h.pyraRate ? `EGP ${h.pyraRate}` : "—";
    const discount = h.walkinRate && h.pyraRate && h.walkinRate > 0
      ? `(${Math.round(((h.walkinRate - h.pyraRate) / h.walkinRate) * 100)}% off)`
      : "";
    return `
      <tr><td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06);">
        <span style="color:#DAA520;font-weight:700;font-size:14px;">🐴 ${h.name}</span>
        ${h.sire ? `<span style="color:rgba(255,255,255,.3);font-size:11px;margin-left:8px;">Sire: ${h.sire}</span>` : ""}
        ${h.dam ? `<span style="color:rgba(255,255,255,.3);font-size:11px;margin-left:8px;">Dam: ${h.dam}</span>` : ""}
        ${h.color ? `<br><span style="color:rgba(255,255,255,.4);font-size:12px;">Color: ${h.color}</span>` : ""}
        <br><span style="color:rgba(255,255,255,.4);font-size:12px;">Skills: ${skills}</span>
        <br><span style="color:rgba(255,255,255,.5);font-size:12px;">Walk-in: <strong style="color:#fff;">${walkin}</strong> &nbsp;→&nbsp; PyraRides: <strong style="color:#DAA520;">${pyra}</strong> <span style="color:rgba(255,255,255,.3);font-size:11px;">${discount}</span></span>
      </td></tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Partner Application — ${d.stableName}</title>
</head>
<body style="margin:0;padding:0;background:#000;color:#fff;font-family:'Inter',-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#000;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#000;">

        <!-- Header -->
        <tr><td style="padding:36px 32px 20px;border-bottom:1px solid rgba(255,255,255,.1);">
          <table width="100%"><tr>
            <td style="font-size:13px;font-weight:700;letter-spacing:.3em;color:#DAA520;text-transform:uppercase;">PYRARIDES — PARTNER APPLICATION</td>
            <td align="right" style="font-size:11px;color:rgba(255,255,255,.4);">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
          </tr></table>
        </td></tr>

        ${section("1. IDENTITY", [
          { label: "Stable Name", value: d.stableName },
          { label: "Owner", value: d.ownerName },
          { label: "WhatsApp", value: d.whatsapp },
          { label: "Google Maps", value: `<a href="${d.googleMapsLink}" style="color:#DAA520;word-break:break-all;">${d.googleMapsLink}</a>` },
          ...(d.socialLink ? [{ label: "Social", value: `<a href="${d.socialLink}" style="color:#DAA520;word-break:break-all;">${d.socialLink}</a>` }] : []),
        ])}

        <!-- Horses -->
        <tr><td style="padding:28px 32px 0;">
          <h2 style="margin:0 0 14px;font-size:16px;color:#DAA520;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">2. TOP HORSES & PER-HORSE PRICING</h2>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(218,165,32,.05);border:1px solid rgba(218,165,32,.12);border-radius:8px;padding:16px;">
            ${horsePricingRows}
          </table>
          <table width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,.04);border-radius:8px;padding:12px;margin-top:8px;">
            <tr><td style="padding:6px 14px;"><span style="color:rgba(255,255,255,.45);font-size:11px;text-transform:uppercase;">EAO/WAHO Registry</span><br><span style="color:#fff;font-size:13px;">${yesNo(d.registry)}</span></td></tr>
            <tr><td style="padding:6px 14px;"><span style="color:rgba(255,255,255,.45);font-size:11px;text-transform:uppercase;">Age Range</span><br><span style="color:#fff;font-size:13px;">${d.ageRange}</span></td></tr>
          </table>
        </td></tr>

        ${section("3. PRESENTATION & GROOMING", [
          { label: "Coat Colors", value: (d.coatColors || []).join(", ") },
          { label: "Grooming Before Sessions", value: yesNo(d.groomingFreq) },
          { label: "Traditional Decorative Tack", value: yesNo(d.decorativeTack) },
        ])}

        ${section("4. TACK & EQUIPMENT", [
          { label: "Saddle Types", value: (d.saddleTypes || []).join(", ") },
          { label: "Tack Replacement Cycle", value: yesNo(d.stirrupReplacement) },
          { label: "Adjustable Stirrups", value: yesNo(d.adjustableStirrups) },
        ])}

        ${section("5. HORSE WELFARE", [
          { label: "Vet Visit Frequency", value: yesNo(d.vetFrequency) },
          { label: "Farrier Schedule", value: yesNo(d.farrierSchedule) },
          { label: "Vaccination & Deworming", value: yesNo(d.vaccination) },
          { label: "Lameness Protocol", value: d.lamenessProtocol },
        ])}

        ${section("6. RIDER SAFETY", [
          { label: "Liability Insurance", value: yesNo(d.insurance) },
          { label: "Fall / Injury Protocol", value: d.fallProtocol },
          { label: "Safety Briefing", value: yesNo(d.safetyBriefing) },
          { label: "Max Rider Weight", value: `${d.maxWeight} kg` },
        ])}

        ${section("7. FACILITIES", [
          { label: "Amenities", value: facilities },
          { label: "Disability Access", value: yesNo(d.disabilityAccess) },
          { label: "Cancellation Policy", value: d.cancellationPolicy },
        ])}

        ${section("8. TOURIST EXPERIENCE", [
          { label: "Routes & Durations", value: d.routes },
          { label: "Nervous Rider Handling", value: d.nervousRider },
        ])}

        ${section("9. OPERATIONS", [
          { label: "Operating Hours", value: d.operatingHours },
          { label: "Max Simultaneous Groups", value: String(d.groupCapacity) },
          { label: "Backup Horse Available", value: yesNo(d.backupHorse) },
          { label: "Walk-in vs Online Priority", value: d.walkinPriority },
        ])}

        ${section("10. PARTNERSHIP TERMS", [
          { label: "Weekly Volume (Peak)", value: d.weeklyVolume },
          { label: "Online Revenue %", value: d.revenueOnline },
          { label: "15-Day Payment Cycle", value: yesNo(d.paymentCycle) },
          { label: "Exclusive Package", value: yesNo(d.exclusivePackage) },
          ...(d.whyFit ? [{ label: "Why They're a Fit", value: `"${d.whyFit}"` }] : []),
        ])}

        <!-- Footer -->
        <tr><td style="padding:36px 32px;border-top:1px solid rgba(255,255,255,.08);margin-top:24px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);text-align:center;">
            Submitted via pyrarides.com/partner
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
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
    const html = buildEmail(data);
    const subject = `🏇 Partner Application: ${data.stableName} — ${data.ownerName} (${data.horses.length} horses)`;

    if (!resend) {
      console.error("Resend not configured — RESEND_API_KEY missing");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const { error } = await resend.emails.send({
      from: "PyraRides <pyrarides@pyrarides.com>",
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send application" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Partner API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
