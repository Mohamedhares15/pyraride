import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/signin" className="flex items-center gap-2 text-ink-muted hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm tracking-wide">Back to Sign In</span>
        </Link>

        <div className="border hairline bg-surface p-10">
          {success ? (
            <div className="text-center space-y-5">
              <CheckCircle className="h-12 w-12 text-foreground mx-auto opacity-70" />
              <div>
                <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Sent</p>
                <h2 className="font-display text-3xl">Check your inbox</h2>
              </div>
              <p className="text-ink-soft text-sm leading-relaxed">
                Password reset instructions are on their way to your email address.
              </p>
              <Link href="/signin">
                <Button variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border hairline">
                  <Mail className="h-6 w-6 text-foreground opacity-60" />
                </div>
                <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-2">Account Recovery</p>
                <h1 className="font-display text-3xl md:text-4xl">Forgot Password?</h1>
                <p className="text-ink-soft text-sm mt-3">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-luxury uppercase text-ink-muted">Email address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border-foreground/20 bg-background text-foreground placeholder:text-ink-muted focus:border-foreground/40"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-[0.15em] text-xs font-medium py-6"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
