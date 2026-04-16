"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Star,
  Building2,
  DollarSign,
  MessageSquare,
  Loader2,
  Heart,
  ShieldCheck,
  MapPin,
  Settings,
  Handshake,
  Globe,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════
// BILINGUAL LABELS
// ══════════════════════════════════════════════════════════════════════════
type Lang = "ar" | "en";

const T = {
  tagline: {
    en: "Partner Application",
    ar: "طلب شراكة",
  },
  title: {
    en: "Become a PyraRides Partner",
    ar: "انضم لشراكة بايراريدز",
  },
  subtitle: {
    en: "PyraRides partners with fewer than 15 top-tier stables to ensure premium equestrian experiences. This application takes approx. 12 minutes.",
    ar: "بايراريدز بتختار أقل من 15 اسطبل من أعلى مستوى عشان تقدم تجارب فروسية ممتازة. التقديم بياخد حوالي 12 دقيقة.",
  },
  saving: { en: "Your progress is auto-saved", ar: "تقدمك محفوظ تلقائياً" },
  stepOf: { en: "Step", ar: "خطوة" },
  of: { en: "of", ar: "من" },
  minLeft: { en: "min left", ar: "دقيقة متبقية" },
  back: { en: "Back", ar: "رجوع" },
  cont: { en: "Continue", ar: "استمر" },
  submit: { en: "Submit My Application", ar: "أقدم طلب الشراكة" },
  submitting: { en: "Submitting...", ar: "جاري الإرسال..." },
  successTitle: { en: "Application Received", ar: "تم استلام الطلب" },
  successBody: {
    en: "Thank you for your interest in joining PyraRides. Our team will review your application and reach out via WhatsApp within 48 hours.",
    ar: "شكراً لاهتمامك بالانضمام لبايراريدز. فريقنا هيراجع الطلب ويتواصل معاك على الواتساب خلال 48 ساعة.",
  },
  backHome: { en: "Back to Home", ar: "الرجوع للرئيسية" },
  required: { en: "Required", ar: "مطلوب" },

  // ── Step Names ──
  steps: [
    { en: "Your Stable's Identity", ar: "هوية اسطبلك" },
    { en: "Your Top Horses", ar: "أفضل خيولك" },
    { en: "Presentation & Grooming", ar: "المظهر والعناية" },
    { en: "Tack & Equipment", ar: "السروج والمعدات" },
    { en: "Horse Welfare", ar: "رعاية الخيول" },
    { en: "Rider Safety", ar: "مهمات الأمان" },
    { en: "Facilities & Amenities", ar: "المرافق والخدمات" },
    { en: "Tourist Experience", ar: "تجربة السياح" },
    { en: "Operations & Capacity", ar: "العمليات والسعة" },
    { en: "Partnership & Pricing", ar: "الشراكة والأسعار" },
  ],

  // ── Step 1: Identity ──
  stableName: { en: "Stable Name", ar: "اسم الاسطبل" },
  ownerName: { en: "Owner Full Name", ar: "اسم صاحب الاسطبل بالكامل" },
  whatsapp: { en: "WhatsApp Number", ar: "رقم الواتساب" },
  googleMaps: { en: "Google Maps Link", ar: "لينك جوجل ماب" },
  socialLink: { en: "Facebook / Instagram Link", ar: "لينك فيسبوك أو انستجرام" },

  // ── Step 2: Top Horses ──
  horsesIntro: {
    en: "List up to 5 of your primary horses:",
    ar: "سجّل أفضل 5 خيول عندك:",
  },
  horseName: { en: "Horse Name", ar: "اسم الحصان" },
  sire: { en: "Sire (Father)", ar: "الأب" },
  dam: { en: "Dam (Mother)", ar: "الأم" },
  color: { en: "Coat Color", ar: "اللون" },
  specialSkills: { en: "Traditional Performance Skills", ar: "المهارات الاستعراضية التقليدية" },
  skillDancing: { en: "Dancing", ar: "رقص" },
  skillRearing: { en: "Rearing (Takbeesh)", ar: "تكبيش" },
  skillLionSit: { en: "Lion Sit", ar: "قعدة الأسد" },
  skillJumping: { en: "Jumping", ar: "نط" },
  registry: { en: "Do any horses carry EAO or WAHO bloodlines?", ar: "عندك خيول مسجّلة في EAO أو WAHO؟" },
  ageRange: { en: "Average age range of active horses", ar: "متوسط أعمار الخيول النشطة" },
  addHorse: { en: "+ Add Horse", ar: "+ أضف حصان" },

  // ── Step 3: Presentation ──
  coatColors: { en: "What coat colors are in your stable?", ar: "إيه الألوان الموجودة في اسطبلك؟" },
  groomingFreq: { en: "Do you groom horses before each tourist session?", ar: "بتجهّز الحصان وتنظفه قبل كل جلسة سياحية؟" },
  decorativeTack: { en: "Do horses wear traditional Egyptian tack for photos?", ar: "الخيول بتلبس سروج وزينة مصرية تقليدية للصور؟" },

  // ── Step 4: Tack ──
  saddleTypes: { en: "What saddle types do you use?", ar: "إيه أنواع السروج اللي بتستخدمها؟" },
  stirrupReplacement: { en: "How often do you replace worn tack (stirrups, girths, reins)?", ar: "كل قد إيه بتغيّر السروج والأحزمة البالية؟" },
  adjustableStirrups: { en: "Do you provide adjustable stirrups?", ar: "عندك ركاب قابل للظبط لطول الفارس؟" },

  // ── Step 5: Welfare ──
  vetFrequency: { en: "How often does a licensed vet visit?", ar: "كل قد إيه بييجي دكتور بيطري مرخّص؟" },
  farrierSchedule: { en: "Farrier (hoof trimming) schedule?", ar: "جدول البيطار (تقليم الحوافر)؟" },
  vaccination: { en: "Vaccinations & deworming on schedule?", ar: "التطعيمات والتخلص من الديدان منتظمة؟" },
  lamenessProtocol: { en: "What do you do if a horse shows lameness during a ride?", ar: "بتعمل إيه لو الحصان عرج أثناء جولة سياحية؟" },

  // ── Step 6: Safety ──
  insurance: { en: "Do you carry liability insurance?", ar: "عندك تأمين مسئولية للأنشطة السياحية؟" },
  fallProtocol: { en: "What happens if a rider falls or is injured?", ar: "بتعمل إيه لو فارس وقع أو اتصاب؟" },
  safetyBriefing: { en: "Do you give a safety briefing before each ride?", ar: "بتشرح تعليمات الأمان قبل كل جلسة؟" },
  maxWeight: { en: "Maximum rider weight (kg)?", ar: "أقصى وزن للفارس (كجم)؟" },

  // ── Step 7: Facilities ──
  cleanRestrooms: { en: "Clean Restrooms", ar: "دورات مياه نظيفة" },
  waitingArea: { en: "Waiting Area", ar: "منطقة انتظار مجهزة" },
  safetyHelmets: { en: "Safety Helmets Available", ar: "خوذات أمان متوفرة" },
  photographySupport: { en: "Photography / Videography Support", ar: "دعم تصوير فوتو وفيديو" },
  refreshments: { en: "Refreshments after ride (water/tea)", ar: "مشروبات بعد الجولة (مياه/شاي)" },
  disabilityAccess: { en: "Can accommodate riders with special needs?", ar: "ممكن تستقبل فرسان من ذوي الاحتياجات الخاصة؟" },
  cancellationPolicy: { en: "What is your 24hr cancellation policy?", ar: "إيه سياسة الإلغاء خلال 24 ساعة؟" },

  // ── Step 8: Experience ──
  routes: { en: "Describe your riding routes with approximate durations", ar: "وصّف مسارات الركوب عندك ومدة كل مسار" },
  nervousRider: { en: "How do you handle a first-time or nervous rider?", ar: "بتتعامل إزاي مع فارس لأول مرة أو خايف؟" },

  // ── Step 9: Operations ──
  operatingHours: { en: "Operating hours", ar: "ساعات العمل" },
  groupCapacity: { en: "Max simultaneous group rides?", ar: "أكبر عدد مجموعات تقدر تخرجهم مع بعض؟" },
  backupHorse: { en: "Backup horse if one becomes unfit before a ride?", ar: "عندك حصان احتياطي لو حصان حجزه اتعب قبل الميعاد؟" },
  walkinPriority: { en: "How do you handle walk-ins when an online booking is confirmed?", ar: "بتعمل إيه لو جالك زبون طياري والحجز الأونلاين متأكد؟" },

  // ── Step 10: Pricing ──
  pricingIntro: {
    en: "Set the exclusive PyraRides rate for each of your registered horses. Customers who book through us pay in advance online — guaranteed bookings, zero no-shows.",
    ar: "حدد سعر الشراكة مع بايراريدز لكل حصان سجلته. الزبون اللي بيحجز من عندنا بيدفع مقدماً أونلاين — حجوزات مضمونة، مفيش عدم حضور.",
  },
  walkinRate: { en: "Standard walk-in rate (EGP/hr)", ar: "السعر المعتاد للزبون الطياري (جنيه/ساعة)" },
  pyraRate: { en: "Partnership rate with PyraRides (EGP/hr)", ar: "سعر الشراكة مع بايراريدز (جنيه/ساعة)" },
  weeklyVolume: { en: "Weekly ride volume in peak season?", ar: "عدد الجولات في الأسبوع في الموسم؟" },
  revenueOnline: { en: "Current % of revenue from online bookings?", ar: "نسبة الدخل من الحجز الأونلاين حالياً؟" },
  paymentCycle: { en: "Open to 15-day payment cycle? (We collect, settle bi-monthly)", ar: "موافق على تحصيل الفلوس كل 15 يوم؟ (بنجمّع ونحوّل كل نص شهر)" },
  exclusivePackage: { en: "Open to co-creating a 'PyraRides Exclusive' experience?", ar: "مستعد نعمل مع بعض باقة 'العرض الحصري' لبايراريدز؟" },
  whyFit: { en: "Why is your stable a strong fit for PyraRides?", ar: "إيه اللي يخلّي اسطبلك شريك مميز لبايراريدز؟" },

  // ── Dropdown Options ──
  yes: { en: "Yes", ar: "أيوه" },
  no: { en: "No", ar: "لأ" },
  some: { en: "Some", ar: "بعضهم" },
  always: { en: "Always", ar: "دايماً" },
  sometimes: { en: "Sometimes", ar: "أحياناً" },
  onRequest: { en: "On request", ar: "لو طلبوا" },
  weekly: { en: "Weekly", ar: "كل أسبوع" },
  biweekly: { en: "Bi-weekly", ar: "كل أسبوعين" },
  monthly: { en: "Monthly", ar: "كل شهر" },
  onlyWhenNeeded: { en: "Only when needed", ar: "لما يحصل مشكلة" },
  every4to6: { en: "Every 4-6 weeks", ar: "كل 4-6 أسابيع" },
  every8: { en: "Every 8 weeks", ar: "كل 8 أسابيع" },
  irregularly: { en: "Irregularly", ar: "مش منتظم" },
  yesWithRecords: { en: "Yes, with records", ar: "أيوه، ومعايا سجلات" },
  yesNoRecords: { en: "Yes, no records", ar: "أيوه، بس من غير سجلات" },
  quarterlyReplace: { en: "Quarterly", ar: "كل 3 شهور" },
  annuallyReplace: { en: "Annually", ar: "كل سنة" },
  whenBroken: { en: "When broken", ar: "لما يبوظ" },
  inProgress: { en: "In progress", ar: "شغالين عليه" },
  needDiscuss: { en: "Need to discuss", ar: "محتاج نتكلم" },
  maybe: { en: "Maybe", ar: "ممكن" },
} as const;

function t(key: keyof typeof T, lang: Lang): string {
  const val = T[key];
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return "";
  return (val as Record<Lang, string>)[lang] || "";
}

// ══════════════════════════════════════════════════════════════════════════
// ZOD SCHEMA
// ══════════════════════════════════════════════════════════════════════════
const horseSchema = z.object({
  name: z.string().min(1),
  sire: z.string().optional().or(z.literal("")),
  dam: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  walkinRate: z.coerce.number().optional(),
  pyraRate: z.coerce.number().optional(),
});

const formSchema = z.object({
  // Step 1
  stableName: z.string().min(2),
  ownerName: z.string().min(2),
  whatsapp: z.string().min(8),
  googleMapsLink: z.string().url(),
  socialLink: z.string().optional().or(z.literal("")),
  // Step 2
  horses: z.array(horseSchema).min(1).max(5),
  registry: z.string().min(1),
  ageRange: z.string().min(1),
  // Step 3
  coatColors: z.array(z.string()).min(1),
  groomingFreq: z.string().min(1),
  decorativeTack: z.string().min(1),
  // Step 4
  saddleTypes: z.array(z.string()).min(1),
  stirrupReplacement: z.string().min(1),
  adjustableStirrups: z.string().min(1),
  // Step 5
  vetFrequency: z.string().min(1),
  farrierSchedule: z.string().min(1),
  vaccination: z.string().min(1),
  lamenessProtocol: z.string().min(5),
  // Step 6
  insurance: z.string().min(1),
  fallProtocol: z.string().min(5),
  safetyBriefing: z.string().min(1),
  maxWeight: z.coerce.number().min(30),
  // Step 7
  cleanRestrooms: z.boolean().default(false),
  waitingArea: z.boolean().default(false),
  safetyHelmets: z.boolean().default(false),
  photographySupport: z.boolean().default(false),
  refreshments: z.boolean().default(false),
  disabilityAccess: z.string().min(1),
  cancellationPolicy: z.string().min(5),
  // Step 8
  routes: z.string().min(5),
  nervousRider: z.string().min(5),
  // Step 9
  operatingHours: z.string().min(3),
  groupCapacity: z.coerce.number().min(1),
  backupHorse: z.string().min(1),
  walkinPriority: z.string().min(5),
  // Step 10
  weeklyVolume: z.string().min(1),
  revenueOnline: z.string().min(1),
  paymentCycle: z.string().min(1),
  exclusivePackage: z.string().min(1),
  whyFit: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

// ══════════════════════════════════════════════════════════════════════════
// STEP DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════
const STEP_ICONS = [Star, Heart, Star, Settings, Heart, ShieldCheck, Building2, MapPin, Settings, Handshake];

const STEP_VALIDATE: (keyof FormData)[][] = [
  ["stableName", "ownerName", "whatsapp", "googleMapsLink"],
  ["horses", "registry", "ageRange"],
  ["coatColors", "groomingFreq", "decorativeTack"],
  ["saddleTypes", "stirrupReplacement", "adjustableStirrups"],
  ["vetFrequency", "farrierSchedule", "vaccination", "lamenessProtocol"],
  ["insurance", "fallProtocol", "safetyBriefing", "maxWeight"],
  ["cleanRestrooms", "disabilityAccess", "cancellationPolicy"],
  ["routes", "nervousRider"],
  ["operatingHours", "groupCapacity", "backupHorse", "walkinPriority"],
  ["weeklyVolume", "revenueOnline", "paymentCycle", "exclusivePackage"],
];

const ESTIMATED_MIN = [1, 3, 1, 1, 2, 2, 1, 2, 1, 2];

const COAT_OPTIONS = ["Bay", "Grey", "Chestnut", "Black", "White", "Palomino", "Piebald/Pinto"];
const SADDLE_OPTIONS = ["English", "Western", "Traditional Egyptian", "Bareback Pad"];
const SKILL_OPTIONS = [
  { en: "Dancing", ar: "رقص", key: "dancing" },
  { en: "Rearing (Takbeesh)", ar: "تكبيش", key: "rearing" },
  { en: "Lion Sit", ar: "قعدة الأسد", key: "lionSit" },
  { en: "Jumping", ar: "نط", key: "jumping" },
];

// ══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
};

const STORAGE_KEY = "pyrarides-partner-app";

// ══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function PartnerPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      horses: [{ name: "", sire: "", dam: "", color: "", skills: [], walkinRate: undefined, pyraRate: undefined }],
      coatColors: [],
      saddleTypes: [],
      cleanRestrooms: false,
      waitingArea: false,
      safetyHelmets: false,
      photographySupport: false,
      refreshments: false,
    },
    mode: "onTouched",
  });

  const { fields: horseFields, append, remove } = useFieldArray({ control, name: "horses" });

  const horses = watch("horses");

  // ── LocalStorage: Restore on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) reset(parsed.formData);
        if (typeof parsed.step === "number") setStep(parsed.step);
        if (parsed.lang) setLang(parsed.lang);
      }
    } catch {}
    setHydrated(true);
  }, [reset]);

  // ── LocalStorage: Save on change ──
  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ formData: getValues(), step, lang })
      );
    } catch {}
  }, [getValues, step, lang]);

  useEffect(() => {
    if (hydrated) saveToStorage();
  }, [step, lang, hydrated, saveToStorage]);

  // Also save when fields change (debounced via watch)
  useEffect(() => {
    const sub = watch(() => { if (hydrated) saveToStorage(); });
    return () => sub.unsubscribe();
  }, [watch, hydrated, saveToStorage]);

  const isRtl = lang === "ar";
  const remainingMin = ESTIMATED_MIN.slice(step).reduce((a, b) => a + b, 0);

  async function goNext() {
    const valid = await trigger(STEP_VALIDATE[step] as any);
    if (!valid) {
      toast.error(lang === "ar" ? "من فضلك كمّل البيانات المطلوبة" : "Please fill in the required fields");
      return;
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, 9));
  }

  function goBack() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      setIsSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
      toast.success(lang === "ar" ? "تم إرسال الطلب بنجاح!" : "Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success Screen ──
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4" dir={isRtl ? "rtl" : "ltr"}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("successTitle", lang)}</h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8">{t("successBody", lang)}</p>
          <a href="/" className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-white/90 transition-all">{t("backHome", lang)}</a>
        </motion.div>
      </div>
    );
  }

  if (!hydrated) return <div className="min-h-screen bg-black" />;

  // ══════════════════════════════════════════════════════════════════════
  // STEP RENDERERS
  // ══════════════════════════════════════════════════════════════════════
  function renderStep() {
    switch (step) {
      // ── Step 1: Identity ──
      case 0:
        return (
          <div className="space-y-4">
            <Field label={t("stableName", lang)} error={errors.stableName?.message} req><input {...register("stableName")} className="fi" placeholder={lang === "ar" ? "مثال: اسطبل أهرامات الجيزة" : "e.g. Pyramids View Stables"} /></Field>
            <Field label={t("ownerName", lang)} error={errors.ownerName?.message} req><input {...register("ownerName")} className="fi" /></Field>
            <Field label={t("whatsapp", lang)} error={errors.whatsapp?.message} req><input {...register("whatsapp")} className="fi" placeholder="+20 XXX XXX XXXX" /></Field>
            <Field label={t("googleMaps", lang)} error={errors.googleMapsLink?.message} req><input {...register("googleMapsLink")} className="fi" placeholder="https://maps.google.com/..." /></Field>
            <Field label={t("socialLink", lang)}><input {...register("socialLink")} className="fi" placeholder="https://instagram.com/..." /></Field>
          </div>
        );

      // ── Step 2: Top Horses ──
      case 1:
        return (
          <div className="space-y-5">
            <p className="text-white/50 text-sm">{t("horsesIntro", lang)}</p>
            {horseFields.map((field, i) => (
              <div key={field.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-semibold text-sm">{lang === "ar" ? `حصان ${i + 1}` : `Horse ${i + 1}`}</span>
                  {i > 0 && <button type="button" onClick={() => remove(i)} className="text-red-400/60 hover:text-red-400 text-xs">{lang === "ar" ? "حذف" : "Remove"}</button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input {...register(`horses.${i}.name`)} className="fi" placeholder={t("horseName", lang)} />
                  <input {...register(`horses.${i}.color`)} className="fi" placeholder={t("color", lang)} />
                  <input {...register(`horses.${i}.sire`)} className="fi" placeholder={t("sire", lang)} />
                  <input {...register(`horses.${i}.dam`)} className="fi" placeholder={t("dam", lang)} />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-2">{t("specialSkills", lang)}</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((sk) => {
                      const currentSkills = watch(`horses.${i}.skills`) || [];
                      const isChecked = currentSkills.includes(sk.key);
                      return (
                        <button key={sk.key} type="button" onClick={() => {
                          const upd = isChecked ? currentSkills.filter((s: string) => s !== sk.key) : [...currentSkills, sk.key];
                          setValue(`horses.${i}.skills`, upd);
                        }} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isChecked ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20"}`}>
                          🐴 {lang === "ar" ? sk.ar : sk.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {horseFields.length < 5 && (
              <button type="button" onClick={() => append({ name: "", sire: "", dam: "", color: "", skills: [], walkinRate: undefined, pyraRate: undefined })} className="text-amber-500/70 hover:text-amber-400 text-sm font-medium">
                {t("addHorse", lang)}
              </button>
            )}
            <Select label={t("registry", lang)} reg={register("registry")} error={errors.registry?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "no", l: t("no", lang) }, { v: "some", l: t("some", lang) },
            ]} req />
            <Select label={t("ageRange", lang)} reg={register("ageRange")} error={errors.ageRange?.message} options={[
              { v: "4-7", l: "4-7" }, { v: "8-12", l: "8-12" }, { v: "13-18", l: "13-18" }, { v: "mixed", l: lang === "ar" ? "متنوع" : "Mixed" },
            ]} req />
          </div>
        );

      // ── Step 3: Presentation ──
      case 2:
        return (
          <div className="space-y-5">
            <MultiCheck label={t("coatColors", lang)} options={COAT_OPTIONS} name="coatColors" register={register} watch={watch} setValue={setValue} error={errors.coatColors?.message} />
            <Select label={t("groomingFreq", lang)} reg={register("groomingFreq")} error={errors.groomingFreq?.message} options={[
              { v: "always", l: t("always", lang) }, { v: "sometimes", l: t("sometimes", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
            <Select label={t("decorativeTack", lang)} reg={register("decorativeTack")} error={errors.decorativeTack?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "no", l: t("no", lang) }, { v: "onRequest", l: t("onRequest", lang) },
            ]} req />
          </div>
        );

      // ── Step 4: Tack & Equipment ──
      case 3:
        return (
          <div className="space-y-5">
            <MultiCheck label={t("saddleTypes", lang)} options={SADDLE_OPTIONS} name="saddleTypes" register={register} watch={watch} setValue={setValue} error={errors.saddleTypes?.message} />
            <Select label={t("stirrupReplacement", lang)} reg={register("stirrupReplacement")} error={errors.stirrupReplacement?.message} options={[
              { v: "quarterly", l: t("quarterlyReplace", lang) }, { v: "annually", l: t("annuallyReplace", lang) }, { v: "whenBroken", l: t("whenBroken", lang) },
            ]} req />
            <Select label={t("adjustableStirrups", lang)} reg={register("adjustableStirrups")} error={errors.adjustableStirrups?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
          </div>
        );

      // ── Step 5: Horse Welfare ──
      case 4:
        return (
          <div className="space-y-5">
            <Select label={t("vetFrequency", lang)} reg={register("vetFrequency")} error={errors.vetFrequency?.message} options={[
              { v: "weekly", l: t("weekly", lang) }, { v: "biweekly", l: t("biweekly", lang) }, { v: "monthly", l: t("monthly", lang) }, { v: "onlyWhenNeeded", l: t("onlyWhenNeeded", lang) },
            ]} req />
            <Select label={t("farrierSchedule", lang)} reg={register("farrierSchedule")} error={errors.farrierSchedule?.message} options={[
              { v: "4-6weeks", l: t("every4to6", lang) }, { v: "8weeks", l: t("every8", lang) }, { v: "irregular", l: t("irregularly", lang) },
            ]} req />
            <Select label={t("vaccination", lang)} reg={register("vaccination")} error={errors.vaccination?.message} options={[
              { v: "yesRecords", l: t("yesWithRecords", lang) }, { v: "yesNoRecords", l: t("yesNoRecords", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
            <Field label={t("lamenessProtocol", lang)} error={errors.lamenessProtocol?.message} req>
              <textarea {...register("lamenessProtocol")} className="fi resize-none" rows={3} placeholder={lang === "ar" ? "وصّف البروتوكول بتاعك..." : "Describe your protocol..."} />
            </Field>
          </div>
        );

      // ── Step 6: Rider Safety ──
      case 5:
        return (
          <div className="space-y-5">
            <Select label={t("insurance", lang)} reg={register("insurance")} error={errors.insurance?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "no", l: t("no", lang) }, { v: "inProgress", l: t("inProgress", lang) },
            ]} req />
            <Field label={t("fallProtocol", lang)} error={errors.fallProtocol?.message} req>
              <textarea {...register("fallProtocol")} className="fi resize-none" rows={3} placeholder={lang === "ar" ? "وصّف الإجراء..." : "Describe your procedure..."} />
            </Field>
            <Select label={t("safetyBriefing", lang)} reg={register("safetyBriefing")} error={errors.safetyBriefing?.message} options={[
              { v: "always", l: t("always", lang) }, { v: "sometimes", l: t("sometimes", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
            <Field label={t("maxWeight", lang)} error={errors.maxWeight?.message} req>
              <input {...register("maxWeight")} type="number" min={30} className="fi" placeholder={lang === "ar" ? "مثال: 100" : "e.g. 100"} />
            </Field>
          </div>
        );

      // ── Step 7: Facilities ──
      case 6:
        return (
          <div className="space-y-5">
            <p className="text-white/40 text-sm mb-1">{lang === "ar" ? "اختار المرافق المتاحة:" : "Select available amenities:"}</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["cleanRestrooms", t("cleanRestrooms", lang)],
                ["waitingArea", t("waitingArea", lang)],
                ["safetyHelmets", t("safetyHelmets", lang)],
                ["photographySupport", t("photographySupport", lang)],
                ["refreshments", t("refreshments", lang)],
              ] as [keyof FormData, string][]).map(([name, label]) => {
                const checked = watch(name) as boolean;
                return (
                  <label key={name} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? "border-amber-500/30 bg-amber-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"}`}>
                    <input type="checkbox" {...register(name)} className="sr-only" />
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center shrink-0 transition-all ${checked ? "border-amber-500 bg-amber-500/20" : "border-white/20"}`}>
                      {checked && <CheckCircle2 className="w-3 h-3 text-amber-500" />}
                    </div>
                    <span className={`text-sm ${checked ? "text-white" : "text-white/50"}`}>{label}</span>
                  </label>
                );
              })}
            </div>
            <Select label={t("disabilityAccess", lang)} reg={register("disabilityAccess")} error={errors.disabilityAccess?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
            <Field label={t("cancellationPolicy", lang)} error={errors.cancellationPolicy?.message} req>
              <textarea {...register("cancellationPolicy")} className="fi resize-none" rows={3} />
            </Field>
          </div>
        );

      // ── Step 8: Tourist Experience ──
      case 7:
        return (
          <div className="space-y-5">
            <Field label={t("routes", lang)} error={errors.routes?.message} req>
              <textarea {...register("routes")} className="fi resize-none" rows={4} placeholder={lang === "ar" ? "مثال: جولة الغروب عند الأهرامات — ساعة ونص" : "e.g. Sunset Pyramids Trail — 1.5 hours"} />
            </Field>
            <Field label={t("nervousRider", lang)} error={errors.nervousRider?.message} req>
              <textarea {...register("nervousRider")} className="fi resize-none" rows={3} />
            </Field>
          </div>
        );

      // ── Step 9: Operations ──
      case 8:
        return (
          <div className="space-y-5">
            <Field label={t("operatingHours", lang)} error={errors.operatingHours?.message} req>
              <input {...register("operatingHours")} className="fi" placeholder={lang === "ar" ? "مثال: 5 الصبح — 6 المغرب" : "e.g. 5 AM — 6 PM"} />
            </Field>
            <Field label={t("groupCapacity", lang)} error={errors.groupCapacity?.message} req>
              <input {...register("groupCapacity")} type="number" min={1} className="fi" placeholder={lang === "ar" ? "مثال: 3" : "e.g. 3"} />
            </Field>
            <Select label={t("backupHorse", lang)} reg={register("backupHorse")} error={errors.backupHorse?.message} options={[
              { v: "always", l: t("always", lang) }, { v: "usually", l: lang === "ar" ? "غالباً" : "Usually" }, { v: "no", l: t("no", lang) },
            ]} req />
            <Field label={t("walkinPriority", lang)} error={errors.walkinPriority?.message} req>
              <textarea {...register("walkinPriority")} className="fi resize-none" rows={3} />
            </Field>
          </div>
        );

      // ── Step 10: Partnership & Pricing ──
      case 9: {
        const namedHorses = horses.filter((h) => h.name && h.name.trim().length > 0);
        return (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-amber-500/5 to-amber-700/5 border border-amber-500/10 rounded-xl p-4 mb-2">
              <p className="text-white/60 text-sm leading-relaxed">{t("pricingIntro", lang)}</p>
            </div>
            {namedHorses.length > 0 ? (
              <div className="space-y-3">
                {namedHorses.map((horse, idx) => {
                  const realIdx = horses.findIndex((h) => h === horse);
                  return (
                    <div key={realIdx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                      <p className="text-amber-400 font-semibold text-sm mb-3">🐴 {horse.name}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t("walkinRate", lang)}>
                          <input {...register(`horses.${realIdx}.walkinRate`)} type="number" min={1} className="fi" placeholder="EGP" />
                        </Field>
                        <Field label={t("pyraRate", lang)}>
                          <input {...register(`horses.${realIdx}.pyraRate`)} type="number" min={1} className="fi" placeholder="EGP" />
                        </Field>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/30 text-sm italic">{lang === "ar" ? "ارجع للخطوة 2 وسجّل أسماء خيولك الأول" : "Go back to Step 2 and add your horse names first"}</p>
            )}
            <Field label={t("weeklyVolume", lang)} error={errors.weeklyVolume?.message} req>
              <input {...register("weeklyVolume")} className="fi" placeholder={lang === "ar" ? "مثال: 40-60 جولة" : "e.g. 40-60 rides"} />
            </Field>
            <Select label={t("revenueOnline", lang)} reg={register("revenueOnline")} error={errors.revenueOnline?.message} options={[
              { v: "0-25", l: "0–25%" }, { v: "25-50", l: "25–50%" }, { v: "50-75", l: "50–75%" }, { v: "75-100", l: "75–100%" },
            ]} req />
            <Select label={t("paymentCycle", lang)} reg={register("paymentCycle")} error={errors.paymentCycle?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "needDiscuss", l: t("needDiscuss", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
            <Select label={t("exclusivePackage", lang)} reg={register("exclusivePackage")} error={errors.exclusivePackage?.message} options={[
              { v: "yes", l: t("yes", lang) }, { v: "maybe", l: t("maybe", lang) }, { v: "no", l: t("no", lang) },
            ]} req />
            <Field label={t("whyFit", lang)}>
              <textarea {...register("whyFit")} className="fi resize-none" rows={4} />
            </Field>
          </div>
        );
      }
      default:
        return null;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════
  const stepLabel = T.steps[step];
  const Icon = STEP_ICONS[step];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* BG orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-700/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-all" id="lang-toggle">
            <Globe className="w-3.5 h-3.5" />
            {lang === "ar" ? "English" : "عربي"}
          </button>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500/90 text-xs font-semibold tracking-widest uppercase">{t("tagline", lang)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{t("title", lang)}</h1>
          <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">{t("subtitle", lang)}</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-1 mb-3 overflow-x-auto scrollbar-hide">
            {T.steps.map((_, i) => {
              const StepIcon = STEP_ICONS[i];
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button key={i} type="button" onClick={() => { if (i < step) { setDir(-1); setStep(i); } }}
                  className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all shrink-0 ${isDone ? "border-amber-500 bg-amber-500/20 cursor-pointer" : isActive ? "border-amber-500 bg-amber-500/10" : "border-white/10 bg-white/[0.02]"}`}
                  id={`step-ind-${i}`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> : <StepIcon className={`w-3.5 h-3.5 ${isActive ? "text-amber-500" : "text-white/20"}`} />}
                </button>
              );
            })}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" initial={false} animate={{ width: `${((step + 1) / 10) * 100}%` }} transition={{ duration: 0.35 }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/30">
            <span>{t("stepOf", lang)} {step + 1} {t("of", lang)} 10</span>
            <span>~{remainingMin} {t("minLeft", lang)}</span>
          </div>
          <p className="text-center text-[11px] text-white/20 mt-1">🔒 {t("saving", lang)}</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-7 backdrop-blur-sm min-h-[400px] flex flex-col">
            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-amber-500 shrink-0" />
                {stepLabel[lang]}
              </h2>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={step} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: "easeInOut" }}>
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between mt-7 pt-5 border-t border-white/[0.06]">
              <button type="button" onClick={goBack} disabled={step === 0}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all ${step === 0 ? "text-white/10 cursor-not-allowed" : "text-white/60 hover:text-white hover:bg-white/5"}`} id="btn-back">
                <ArrowLeft className="w-4 h-4" /> {t("back", lang)}
              </button>
              {step < 9 ? (
                <button type="button" onClick={goNext} className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20" id="btn-next">
                  {t("cont", lang)} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50" id="btn-submit">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("submitting", lang)}</> : t("submit", lang)}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .fi{width:100%;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#fff;font-size:14px;outline:none;transition:all .2s}
        .fi::placeholder{color:rgba(255,255,255,.2)}
        .fi:focus{border-color:rgba(218,165,32,.4);background:rgba(255,255,255,.06);box-shadow:0 0 0 3px rgba(218,165,32,.08)}
        .sel{width:100%;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#fff;font-size:14px;outline:none;appearance:none;-webkit-appearance:none;transition:all .2s}
        .sel:focus{border-color:rgba(218,165,32,.4);background:rgba(255,255,255,.06)}
        .sel option{background:#1a1a1a;color:#fff}
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════
function Field({ label, error, children, req }: { label: string; error?: string; children: React.ReactNode; req?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">
        {label} {req && <span className="text-amber-500/60">*</span>}
      </label>
      {children}
      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1 flex items-center gap-1"><span className="inline-block w-1 h-1 bg-red-400 rounded-full" />{error}</motion.p>}
    </div>
  );
}

function Select({ label, reg, options, error, req }: { label: string; reg: any; options: { v: string; l: string }[]; error?: string; req?: boolean }) {
  return (
    <Field label={label} error={error} req={req}>
      <select {...reg} className="sel">
        <option value="">—</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </Field>
  );
}

function MultiCheck({ label, options, name, register, watch, setValue, error }: {
  label: string; options: string[]; name: "coatColors" | "saddleTypes"; register: any; watch: any; setValue: any; error?: string;
}) {
  const current: string[] = watch(name) || [];
  return (
    <Field label={label} error={error} req>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((opt) => {
          const checked = current.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => {
              const upd = checked ? current.filter((c: string) => c !== opt) : [...current, opt];
              setValue(name, upd, { shouldValidate: true });
            }} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${checked ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20"}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </Field>
  );
}
