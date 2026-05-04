"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@/components/shared/shims";
import { Reveal, easeLuxury } from "@/components/shared/Motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
const gallery1 = "/assets/gallery-1.jpg";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await signUp({ fullName: name, email });
      toast.success("Your reservation key has been written.");
      navigate("/dashboard");
    } catch {
      toast.error("Could not create your account.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-[100vh] grid md:grid-cols-2 pt-20 md:pt-0">
      <aside className="relative hidden md:block bg-foreground text-background overflow-hidden">
        <motion.img
          src={gallery1}
          alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ duration: 1.2, ease: easeLuxury }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/30 to-foreground/80" />
        <div className="relative h-full flex flex-col justify-between p-12 lg:p-16">
          <Link to="/" className="font-display text-2xl tracking-tight">
            PyraRides<span className="opacity-60">.</span>
          </Link>
          <div>
            <p className="text-[11px] tracking-luxury uppercase opacity-75 mb-6">Open an account</p>
            <h2 className="font-display text-4xl lg:text-6xl leading-[1.02] text-balance max-w-md">
              Begin a record that will outlast the season.
            </h2>
          </div>
          <div className="text-[10px] tracking-luxury uppercase opacity-60">Est. 1924 · Giza, Egypt</div>
        </div>
      </aside>

      <section className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 md:py-12">
        <div className="max-w-md w-full mx-auto">
          <Reveal>
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-6">Open an account</p>
          </Reveal>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.02] text-balance">
            Begin your <em className="italic text-ink-soft">ledger</em>.
          </h1>

          <form onSubmit={submit} className="mt-10 space-y-7">
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Full name</span>
              <input
                value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                placeholder="Yusuf Al-Nasr"
                className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Email</span>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                placeholder="you@quiet.email"
                className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Password</span>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" placeholder="••••••••"
                className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
              />
            </label>

            <button
              type="submit" disabled={pending}
              className="w-full bg-foreground text-background py-5 text-[12px] tracking-[0.22em] uppercase disabled:opacity-70"
            >
              {pending ? "One moment…" : "Open ledger →"}
            </button>
          </form>

          <p className="mt-12 text-[12px] tracking-luxury uppercase text-ink-muted">
            Already a guest?{" "}
            <Link to="/signin" className="text-foreground border-b hairline pb-0.5 hover:border-foreground transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
