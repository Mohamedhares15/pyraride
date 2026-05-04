import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Reveal } from "@/components/shared/Motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await sendPasswordReset(email);
    setPending(false);
    setSent(true);
    toast.success("If that address is on our ledger, instructions are on the way.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
      <div className="w-full max-w-md">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">House recovery</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.02] text-balance">
            Forgotten the key.
          </h1>
          <p className="mt-6 text-ink-soft text-pretty">
            Leave your address and we will send a quiet line for resetting your password.
          </p>
        </Reveal>

        {!sent ? (
          <form onSubmit={submit} className="mt-12 space-y-7">
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@quiet.email"
                className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
              />
            </label>
            <button
              disabled={pending}
              className="w-full bg-foreground text-background py-5 text-[12px] tracking-[0.22em] uppercase disabled:opacity-70"
            >
              {pending ? "One moment…" : "Send instructions →"}
            </button>
          </form>
        ) : (
          <div className="mt-12 border hairline p-8 bg-surface">
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted">Sent</p>
            <p className="mt-3 font-display text-2xl leading-tight">Check your inbox.</p>
            <p className="mt-3 text-sm text-ink-soft">
              The note will arrive within a few minutes. If it has not, write to{" "}
              <Link to="/contact" className="border-b hairline hover:border-foreground">the concierge</Link>.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-6 text-[11px] tracking-luxury uppercase border-b hairline pb-1 hover:border-foreground"
            >
              ← Return to sign in
            </button>
          </div>
        )}

        <p className="mt-12 text-[11px] tracking-luxury uppercase text-ink-muted">
          Remembered it after all?{" "}
          <Link to="/auth" className="text-foreground border-b hairline hover:border-foreground">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
