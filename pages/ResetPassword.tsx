import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Reveal } from "@/components/shared/Motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("The two entries do not match.");
    if (password.length < 8) return toast.error("Eight characters or more, please.");
    setPending(true);
    await resetPassword("mock-token", password);
    setPending(false);
    toast.success("Your key has been changed. Welcome back.");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
      <div className="w-full max-w-md">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">A new key</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.02] text-balance">
            Set a fresh password.
          </h1>
          <p className="mt-6 text-ink-soft text-pretty">
            Choose something you will remember on the morning of a sunrise ride.
          </p>
        </Reveal>

        <form onSubmit={submit} className="mt-12 space-y-7">
          <label className="block">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">New password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Repeat new password</span>
            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-2 w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors"
            />
          </label>
          <button
            disabled={pending}
            className="w-full bg-foreground text-background py-5 text-[12px] tracking-[0.22em] uppercase disabled:opacity-70"
          >
            {pending ? "Saving…" : "Set new password →"}
          </button>
        </form>

        <p className="mt-12 text-[11px] tracking-luxury uppercase text-ink-muted">
          <Link to="/auth" className="text-foreground border-b hairline hover:border-foreground">
            ← Return to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
