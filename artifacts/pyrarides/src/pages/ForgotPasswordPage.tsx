import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/signin" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Sign In</span>
        </Link>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Email Sent!</h2>
              <p className="text-white/60 text-sm">Check your inbox for password reset instructions.</p>
              <Link href="/signin">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Mail className="h-10 w-10 text-[#D4AF37] mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                <p className="text-white/60 text-sm mt-2">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>}
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  required
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold">
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
