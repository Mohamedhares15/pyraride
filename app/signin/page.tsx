"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/PasswordInput";

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email/phone and password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 h-full w-full opacity-30"
          style={{
            backgroundImage: "url(/hero-bg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-4xl">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Sign in to continue your PyraRide journey
            </p>
          </div>

          {/* Sign In Form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl sm:p-8">
            <form onSubmit={handleSignIn} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Email or phone number
                </label>
                <Input
                  type="text"
                  placeholder="you@example.com or +201234567890"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Password</label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-white/70 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Home Button */}
          <div className="mt-6 text-center">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
