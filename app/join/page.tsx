"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
} from "lucide-react";

// ── Zod Schema ──────────────────────────────────────────────────────────
const partnerSchema = z.object({
  stableName: z.string().min(2, "Stable name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  whatsapp: z.string().min(8, "Valid WhatsApp number required"),
  googleMapsLink: z.string().url("Must be a valid Google Maps URL"),
  socialLink: z.string().optional().or(z.literal("")),

  horseCount: z.coerce.number().min(1, "At least 1 horse"),
  horseTypes: z.string().min(2, "Please specify horse types"),
  restPeriods: z.enum(["yes", "no"]),
  guideType: z.string().min(2, "Please specify guide type"),
  languages: z.string().min(2, "Please specify languages"),

  cleanRestrooms: z.boolean().default(false),
  waitingArea: z.boolean().default(false),
  safetyHelmets: z.boolean().default(false),
  photographySupport: z.boolean().default(false),
  cancellationPolicy: z.string().min(5, "Please describe your cancellation policy"),

  standardRate: z.coerce.number().min(1, "Enter your standard rate"),
  exclusiveRate: z.coerce.number().min(1, "Enter your exclusive rate"),
  weeklyVolume: z.string().min(1, "Enter weekly ride volume"),

  uniqueStrength: z.string().optional().or(z.literal("")),
});

type PartnerForm = z.infer<typeof partnerSchema>;

const STEPS = [
  { id: 0, title: "Identity & Pride", icon: Star, fields: ["stableName", "ownerName", "whatsapp", "googleMapsLink", "socialLink"] as const },
  { id: 1, title: "Your Standards", icon: Shield, fields: ["horseCount", "horseTypes", "restPeriods", "guideType", "languages"] as const },
  { id: 2, title: "Facilities & Safety", icon: Building2, fields: ["cleanRestrooms", "waitingArea", "safetyHelmets", "photographySupport", "cancellationPolicy"] as const },
  { id: 3, title: "Partnership Details", icon: DollarSign, fields: ["standardRate", "exclusiveRate", "weeklyVolume"] as const },
  { id: 4, title: "Final Thoughts", icon: MessageSquare, fields: ["uniqueStrength"] as const },
];

// ── Animations ──────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

// ── Page Component ──────────────────────────────────────────────────────
export default function JoinPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PartnerForm>({
    resolver: zodResolver(partnerSchema) as any,
    defaultValues: {
      cleanRestrooms: false,
      waitingArea: false,
      safetyHelmets: false,
      photographySupport: false,
    },
    mode: "onTouched",
  });

  const currentStep = STEPS[step];

  async function goNext() {
    const valid = await trigger(currentStep.fields as any);
    if (!valid) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: PartnerForm) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong");
      }

      setIsSuccess(true);
      toast.success("Application submitted! We'll be in touch soon.", {
        duration: 6000,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application. Please try again.", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success State ───────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-lg"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Application Received
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Thank you for your interest in joining PyraRides. Our team will review
            your application and reach out via WhatsApp within 48 hours.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-white/90 transition-all"
          >
            Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  // ── Step Content ────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <Field label="Stable Name *" error={errors.stableName?.message}>
              <input
                {...register("stableName")}
                placeholder="e.g. Pyramids View Stables"
                className="form-input"
                id="stableName"
              />
            </Field>
            <Field label="Owner Full Name *" error={errors.ownerName?.message}>
              <input
                {...register("ownerName")}
                placeholder="Your full name"
                className="form-input"
                id="ownerName"
              />
            </Field>
            <Field label="WhatsApp Number *" error={errors.whatsapp?.message}>
              <input
                {...register("whatsapp")}
                placeholder="+20 XXX XXX XXXX"
                className="form-input"
                id="whatsapp"
              />
            </Field>
            <Field label="Google Maps Link *" error={errors.googleMapsLink?.message}>
              <input
                {...register("googleMapsLink")}
                placeholder="https://maps.google.com/..."
                className="form-input"
                id="googleMapsLink"
              />
            </Field>
            <Field label="Facebook or Instagram Link" error={errors.socialLink?.message}>
              <input
                {...register("socialLink")}
                placeholder="https://instagram.com/..."
                className="form-input"
                id="socialLink"
              />
            </Field>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <Field label="Number of Active Horses *" error={errors.horseCount?.message}>
              <input
                {...register("horseCount")}
                type="number"
                min={1}
                placeholder="e.g. 12"
                className="form-input"
                id="horseCount"
              />
            </Field>
            <Field label="Types of Horses *" error={errors.horseTypes?.message}>
              <input
                {...register("horseTypes")}
                placeholder="e.g. Arabian, Mixed, Thoroughbred"
                className="form-input"
                id="horseTypes"
              />
            </Field>
            <Field label="Do your horses have rest periods between rides? *" error={errors.restPeriods?.message}>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    value="yes"
                    {...register("restPeriods")}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-white/20 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500/20 flex items-center justify-center transition-all">
                    <div className="w-2 h-2 rounded-full bg-amber-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-white/80 group-hover:text-white transition-colors">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    value="no"
                    {...register("restPeriods")}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-white/20 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500/20 flex items-center justify-center transition-all">
                    <div className="w-2 h-2 rounded-full bg-amber-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-white/80 group-hover:text-white transition-colors">No</span>
                </label>
              </div>
            </Field>
            <Field label="Who accompanies the rider? *" error={errors.guideType?.message}>
              <input
                {...register("guideType")}
                placeholder="e.g. Trained Guide, Stable Boy, Both"
                className="form-input"
                id="guideType"
              />
            </Field>
            <Field label="Languages Spoken by Guides *" error={errors.languages?.message}>
              <input
                {...register("languages")}
                placeholder="e.g. Arabic, English, French"
                className="form-input"
                id="languages"
              />
            </Field>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <p className="text-white/50 text-sm mb-2">
              Select all facilities your stable provides:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Checkbox
                label="Clean Restrooms"
                name="cleanRestrooms"
                register={register}
                watch={watch}
              />
              <Checkbox
                label="Waiting Area"
                name="waitingArea"
                register={register}
                watch={watch}
              />
              <Checkbox
                label="Safety Helmets"
                name="safetyHelmets"
                register={register}
                watch={watch}
              />
              <Checkbox
                label="Photography Support"
                name="photographySupport"
                register={register}
                watch={watch}
              />
            </div>
            <Field label="What is your 24hr cancellation policy? *" error={errors.cancellationPolicy?.message}>
              <textarea
                {...register("cancellationPolicy")}
                rows={3}
                placeholder="Describe how you handle cancellations within 24 hours of the ride..."
                className="form-input resize-none"
                id="cancellationPolicy"
              />
            </Field>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <Field label="Standard rate for a 1-hour private ride (EGP) *" error={errors.standardRate?.message}>
              <input
                {...register("standardRate")}
                type="number"
                min={1}
                placeholder="e.g. 800"
                className="form-input"
                id="standardRate"
              />
            </Field>
            <div className="bg-gradient-to-br from-amber-500/5 to-amber-700/5 border border-amber-500/10 rounded-xl p-5">
              <Field
                label="Exclusive PyraRides rate for pre-paid online bookings (EGP) *"
                error={errors.exclusiveRate?.message}
              >
                <input
                  {...register("exclusiveRate")}
                  type="number"
                  min={1}
                  placeholder="e.g. 600"
                  className="form-input"
                  id="exclusiveRate"
                />
              </Field>
              <p className="text-amber-500/60 text-xs mt-2">
                Customers who book through PyraRides pay in advance online, guaranteeing you confirmed bookings with zero no-shows.
              </p>
            </div>
            <Field label="Weekly ride volume in peak season *" error={errors.weeklyVolume?.message}>
              <input
                {...register("weeklyVolume")}
                placeholder="e.g. 40-60 rides per week"
                className="form-input"
                id="weeklyVolume"
              />
            </Field>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <Field label="Is there anything about your stable that makes you a strong fit for PyraRides?" error={errors.uniqueStrength?.message}>
              <textarea
                {...register("uniqueStrength")}
                rows={5}
                placeholder="Tell us what sets you apart — your history, your horses, your hospitality..."
                className="form-input resize-none"
                id="uniqueStrength"
              />
            </Field>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-700/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500/90 text-xs font-semibold tracking-widest uppercase">
              Partner Application
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Become a PyraRides Partner
          </h1>
          <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            PyraRides partners with fewer than 15 top-tier stables to ensure
            premium equestrian experiences. This application takes approx. 7 minutes.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (i < step) {
                      setDirection(-1);
                      setStep(i);
                    }
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isDone
                      ? "border-amber-500 bg-amber-500/20 cursor-pointer"
                      : isActive
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                  id={`step-indicator-${i}`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-amber-500" : "text-white/20"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-white/30 text-xs">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-white/30 text-xs">{currentStep.title}</span>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur-sm min-h-[380px] flex flex-col">
            {/* Step Title */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                {(() => { const Icon = currentStep.icon; return <Icon className="w-5 h-5 text-amber-500" />; })()}
                {currentStep.title}
              </h2>
            </div>

            {/* Step Content with Animation */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className={`flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-all ${
                  step === 0
                    ? "text-white/10 cursor-not-allowed"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                id="btn-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold text-sm px-6 py-2.5 rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
                  id="btn-next"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold text-sm px-6 py-2.5 rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit My Application"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* CSS for form inputs */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }
        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
        .form-input:focus {
          border-color: rgba(218, 165, 32, 0.4);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.08);
        }
      `}</style>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

function Checkbox({
  label,
  name,
  register,
  watch,
}: {
  label: string;
  name: "cleanRestrooms" | "waitingArea" | "safetyHelmets" | "photographySupport";
  register: any;
  watch: any;
}) {
  const checked = watch(name);
  return (
    <label
      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
        checked
          ? "border-amber-500/30 bg-amber-500/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
      }`}
    >
      <input type="checkbox" {...register(name)} className="sr-only" />
      <div
        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
          checked ? "border-amber-500 bg-amber-500/20" : "border-white/20"
        }`}
      >
        {checked && <CheckCircle2 className="w-3 h-3 text-amber-500" />}
      </div>
      <span className={`text-sm ${checked ? "text-white" : "text-white/50"}`}>
        {label}
      </span>
    </label>
  );
}
