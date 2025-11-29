"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/PasswordInput";
import PhoneInput from "@/components/shared/PhoneInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "",
    initialTier: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formatError = (primary?: string, detail?: string) =>
      [primary, detail].filter(Boolean).join(" — ");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          initialTier: formData.initialTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(formatError(data.error, data.details) || "Registration failed");
        return;
      }

      // Auto sign in after registration
      await signIn("credentials", {
        identifier: formData.email,
        password: formData.password,
        redirect: false,
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
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
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-6 text-center">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-4xl">
              Join PyraRide
            </h1>
            <p className="text-white/70">
              Start your horse riding adventure at the pyramids
            </p>
          </div>

          {/* Sign Up Form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl sm:p-8">
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Full name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Phone number</label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(value) => updateField("phoneNumber", value)}
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Gender <span className="text-red-400">*</span>
                </label>
                <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)} required>
                  <SelectTrigger className="h-11 bg-white/10 border-white/20 text-white focus:border-white/40">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Riding Experience Level <span className="text-red-400">*</span>
                </label>
                <Select
                  value={formData.initialTier}
                  onValueChange={(value) => updateField("initialTier", value)}
                  required
                >
                  <SelectTrigger className="h-11 bg-white/10 border-white/20 text-white focus:border-white/40">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_time">First Time (300-650 points)</SelectItem>
                    <SelectItem value="beginner">Beginner (651-1300 points)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1301-1700 points)</SelectItem>
                    <SelectItem value="advanced">Advanced (1701+ points)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60">
                  This determines your starting rank points. You can improve through rides!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <PasswordInput
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  required
                />
                <p className="text-xs text-white/60">
                  At least 8 characters, including uppercase, lowercase, and number.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
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

