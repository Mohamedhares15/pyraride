import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/shared/PasswordInput";
import { CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccess("Password reset successfully. Redirecting to sign in...");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border hairline bg-surface p-10">
          <div className="text-center mb-8">
            {success ? (
              <CheckCircle className="h-12 w-12 text-foreground mx-auto mb-4 opacity-70" />
            ) : null}
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Security</p>
            <h1 className="font-display text-3xl md:text-4xl">Reset Password</h1>
            <p className="text-ink-soft text-sm mt-3">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="border border-foreground/20 bg-surface p-3 text-sm text-foreground">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] tracking-luxury uppercase text-ink-muted">New Password</label>
              <PasswordInput
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="border-foreground/20 bg-background text-foreground placeholder:text-ink-muted"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] tracking-luxury uppercase text-ink-muted">Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="border-foreground/20 bg-background text-foreground placeholder:text-ink-muted"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-[0.15em] text-xs font-medium py-6"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            <Link href="/signin" className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
