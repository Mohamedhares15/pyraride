import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Reveal, easeLuxury } from "@/components/shared/Motion";
import { toast } from "sonner";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import horsePortrait from "@/assets/horse-portrait.jpg";

type Mode = "signin" | "signup";

const Field = ({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) => (
  <label className="block group">
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
    />
  </label>
);

const Auth = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      setPending(false);
      toast.success(
        mode === "signin"
          ? "Welcome back. The courtyard is open."
          : "Your reservation key has been written.",
      );
      navigate("/dashboard");
    }, 900);
  };

  const images = mode === "signin" ? [gallery6, horsePortrait] : [gallery1, horsePortrait];

  return (
    <div className="min-h-[100vh] grid md:grid-cols-2 pt-20 md:pt-0">
      {/* Left — editorial pane */}
      <aside className="relative hidden md:block bg-foreground text-background overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[0]}
            src={images[0]}
            alt=""
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: easeLuxury }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/30 to-foreground/80" />

        <div className="relative h-full flex flex-col justify-between p-12 lg:p-16">
          <Link to="/" className="font-display text-2xl tracking-tight">
            PyraRides<span className="opacity-60">.</span>
          </Link>

          <div>
            <p className="text-[11px] tracking-luxury uppercase opacity-75 mb-6">A private ledger</p>
            <h2 className="font-display text-4xl lg:text-6xl leading-[1.02] text-balance max-w-md">
              Your reservations, kept by the same hands for one hundred years.
            </h2>
            <p className="mt-8 max-w-sm opacity-80 text-pretty leading-relaxed">
              Sign in to find your upcoming rides, the horses you have known, and the mornings still to come.
            </p>
          </div>

          <div className="text-[10px] tracking-luxury uppercase opacity-60">
            Est. 1924 · Giza, Egypt
          </div>
        </div>
      </aside>

      {/* Right — form pane */}
      <section className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 md:py-12">
        <div className="max-w-md w-full mx-auto">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">
              {mode === "signin" ? "Welcome back" : "Open an account"}
            </p>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: easeLuxury }}
              className="font-display text-5xl md:text-6xl leading-[1.02] text-balance"
            >
              {mode === "signin" ? (
                <>Enter the <em className="italic text-ink-soft">house</em>.</>
              ) : (
                <>Begin your <em className="italic text-ink-soft">ledger</em>.</>
              )}
            </motion.h1>
          </AnimatePresence>

          {/* Mode toggle */}
          <div className="mt-10 inline-flex border hairline">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="relative px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase"
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-toggle"
                    className="absolute inset-0 bg-foreground"
                    transition={{ duration: 0.5, ease: easeLuxury }}
                  />
                )}
                <span className={`relative ${mode === m ? "text-background" : "text-ink-soft"}`}>
                  {m === "signin" ? "Sign in" : "Create account"}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-10 space-y-7">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: easeLuxury }}
                  className="overflow-hidden"
                >
                  <Field label="Full name" value={name} onChange={setName} autoComplete="name" placeholder="Yusuf Al-Nasr" />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="you@quiet.email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
            />

            {mode === "signin" && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors"
                >
                  Forgot password
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="group relative w-full bg-foreground text-background py-5 text-[12px] tracking-[0.22em] uppercase overflow-hidden disabled:opacity-70"
            >
              <span className="relative">
                {pending ? "One moment…" : mode === "signin" ? "Enter →" : "Open ledger →"}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 text-[10px] tracking-luxury uppercase text-ink-muted">
              <span className="flex-1 h-px bg-hairline" />
              or
              <span className="flex-1 h-px bg-hairline" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Google", "Apple"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toast("Connect Lovable Cloud to enable social sign-in.")}
                  className="border hairline py-4 text-[11px] tracking-[0.18em] uppercase hover:bg-surface transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </form>

          <p className="mt-12 text-[11px] tracking-luxury uppercase text-ink-muted">
            By continuing you agree to our{" "}
            <Link to="/about" className="border-b hairline pb-0.5 hover:border-foreground transition-colors">
              house terms
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
};

export default Auth;
