import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/shared/PasswordInput";

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
        setSuccess("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-white/60 text-sm mt-2">Enter your new password below.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">{success}</div>}
            <div className="space-y-2">
              <label className="text-sm text-white/70">New Password</label>
              <PasswordInput
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            <Link href="/signin" className="text-[#D4AF37] hover:underline">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
