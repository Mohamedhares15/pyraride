import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/PasswordInput";

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
      } else {
        navigate("/signin");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/60">Join PyraRides to book your experience</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Full Name</label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Phone Number</label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+20 xxx xxx xxxx"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Password</label>
              <PasswordInput
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <p className="text-xs text-white/50">
                I agree to the{" "}
                <Link href="/terms" className="text-[#D4AF37] hover:underline">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#D4AF37] hover:underline">Privacy Policy</Link>
              </p>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#D4AF37] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
