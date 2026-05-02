import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import heroImg from "@/assets/hero-pyramids.jpg";
import { easeLuxury } from "@/components/shared/Motion";

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((f) => ({ ...f, [key]: e.target.value }));

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) { setError("Please accept the terms and conditions."); return; }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
      } else {
        navigate("/signin");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — cinematic image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImg}
          alt="Rider before the Pyramids"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link href="/">
            <span className="font-display text-2xl text-background tracking-luxury uppercase">PyraRides</span>
          </Link>
          <div>
            <p className="text-[11px] tracking-luxury uppercase text-background/60 mb-4">Join the circle</p>
            <p className="font-display text-4xl xl:text-5xl text-background leading-[1.1] max-w-md text-balance">
              Curate your journey from the very first moment.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Exclusive sunrise & desert rides",
                "Circle Loyalty rewards from day one",
                "Private concierge at your service",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-background/80 text-sm">
                  <span className="flex-shrink-0 size-5 border border-background/30 flex items-center justify-center">
                    <Check className="size-3 text-background" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeLuxury }}
        >
          <Link href="/" className="lg:hidden block mb-10 font-display text-2xl tracking-luxury uppercase">
            PyraRides
          </Link>

          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Create account</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-2">Begin your journey</h1>
          <p className="text-ink-soft text-sm mb-10">Join over 2,400 riders experiencing Egypt's finest equestrian platform.</p>

          {error && (
            <div className="mb-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            {(
              [
                { key: "fullName" as const, label: "Full Name", type: "text", placeholder: "Ahmed Al-Rashid", required: true },
                { key: "email" as const, label: "Email Address", type: "email", placeholder: "your@email.com", required: true },
                { key: "phoneNumber" as const, label: "Phone Number", type: "tel", placeholder: "+20 xxx xxx xxxx", required: false },
              ] satisfies Array<{ key: keyof typeof formData; label: string; type: string; placeholder: string; required: boolean }>
            ).map(({ key, label, type, placeholder, required }) => (
              <div key={key}>
                <label className="block text-[11px] tracking-luxury uppercase text-ink-muted mb-2">{label}</label>
                <input
                  type={type}
                  value={formData[key]}
                  onChange={update(key)}
                  placeholder={placeholder}
                  required={required}
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50"
                />
              </div>
            ))}

            <div>
              <label className="block text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={update("password")}
                  placeholder="Create a strong password"
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 bottom-3 text-ink-muted hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setAcceptedTerms((v) => !v)}
                className={`flex-shrink-0 mt-0.5 size-4 border transition-colors ${acceptedTerms ? "bg-foreground border-foreground" : "border-ink-muted group-hover:border-foreground"}`}
                aria-label="Accept terms and conditions"
              >
                {acceptedTerms && <Check className="size-3 text-background m-auto" />}
              </button>
              <p className="text-xs text-ink-muted leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-foreground underline underline-offset-2">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-2">Privacy Policy</Link>
              </p>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 px-7 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Creating account…" : (
                <>Create account <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t hairline text-center">
            <p className="text-sm text-ink-muted">
              Already have an account?{" "}
              <Link href="/signin" className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
