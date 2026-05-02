"use client";
import { useState, Suspense } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/PasswordInput";

function SignInContent() {
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        setError(data.error || "Invalid credentials. Please check your email/phone and password.");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/60">Sign in to your PyraRides account</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Email or Phone</label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or phone"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Password</label>
              <PasswordInput
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-[#D4AF37] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#D4AF37] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return <SignInContent />;
}
