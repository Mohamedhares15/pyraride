import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import heroImg from "@/assets/hero-pyramids.jpg";

function SignInPage() {
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid credentials. Please check your details.");
      } else {
        navigate("/");
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link href="/">
            <span className="font-display text-2xl text-white tracking-widest uppercase">PyraRides</span>
          </Link>
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-white/60 mb-4">Est. Giza · By reservation only</p>
            <p className="font-display text-4xl xl:text-5xl text-white leading-[1.1] max-w-md">
              The heritage of the Pyramids, by horseback.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                  <div className="w-full h-full bg-gradient-to-br from-amber-700/60 to-amber-900/60" />
                </div>
              ))}
              <p className="text-sm text-white/70 ml-2">Trusted by 2,400+ riders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block mb-10 font-display text-2xl tracking-widest uppercase">
            PyraRides
          </Link>

          <p className="text-[11px] tracking-[0.25em] uppercase text-ink-muted mb-3">Welcome back</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-2">Sign in to your account</h1>
          <p className="text-ink-soft text-sm mb-10">Enter your credentials to continue your journey.</p>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-[11px] tracking-luxury uppercase text-ink-muted mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your@email.com or +20 xxx xxx xxxx"
                className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] tracking-luxury uppercase text-ink-muted">Password</label>
                <Link href="/forgot-password" className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-ink-muted/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 bottom-3 text-ink-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 px-7 py-4 bg-foreground text-background text-[12px] tracking-[0.2em] uppercase mt-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Signing in…" : (
                <>
                  Sign in <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t hairline text-center">
            <p className="text-sm text-ink-muted">
              Don't have an account?{" "}
              <Link href="/signup" className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SignInPage;
