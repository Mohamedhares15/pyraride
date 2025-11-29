"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordInput from "./PasswordInput";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "signin" | "signup";
}

export default function AuthModal({ open, onOpenChange, initialTab = "signin" }: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">(initialTab);
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpForm, setSignUpForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "",
    initialTier: "",
  });
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetFeedback = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "signin" | "signup" | "forgot");
    setIsLoading(false);
    setSignInPassword("");
    resetFeedback();
  };

  // Update activeTab when modal opens with a new initialTab
  useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFeedback();

    try {
      const result = await signIn("credentials", {
        identifier: signInIdentifier,
        password: signInPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email/phone and password.");
      } else {
        setSignInIdentifier("");
        setSignInPassword("");
        onOpenChange(false);
        // Check if we're on a callback URL (from signin page)
        const callbackUrl = new URL(window.location.href).searchParams.get("callbackUrl");
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFeedback();

    const formatError = (primary?: string, detail?: string) =>
      [primary, detail].filter(Boolean).join(" — ");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signUpForm.email,
          password: signUpForm.password,
          fullName: signUpForm.fullName,
          phoneNumber: signUpForm.phoneNumber,
          gender: signUpForm.gender,
          initialTier: signUpForm.initialTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(formatError(data.error, data.details) || "Registration failed");
        return;
      }

      // Auto sign in after registration
      await signIn("credentials", {
        identifier: signUpForm.email,
        password: signUpForm.password,
        redirect: false,
      });

      onOpenChange(false);
      setSignUpForm({ fullName: "", email: "", phoneNumber: "", password: "", gender: "", initialTier: "" });
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFeedback();

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.error || data.details
            ? [data.error, data.details].filter(Boolean).join(" — ")
            : null;
        setError(message || "Unable to process request.");
        return;
      }

      setSuccessMessage(
        data.message ||
          "If an account exists, you will receive password reset instructions shortly."
      );
      setForgotIdentifier("");
    } catch (error) {
      setError("Unable to process request. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email or phone number</label>
        <Input
          type="text"
          placeholder="you@example.com or +201234567890"
          value={signInIdentifier}
          onChange={(e) => {
            setSignInIdentifier(e.target.value);
            resetFeedback();
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <PasswordInput
          value={signInPassword}
          onChange={(e) => {
            setSignInPassword(e.target.value);
            resetFeedback();
          }}
          placeholder="••••••••"
          required
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => handleTabChange("forgot")}
        >
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Full name</label>
        <Input
          type="text"
          placeholder="John Doe"
          value={signUpForm.fullName}
          onChange={(e) => {
            setSignUpForm((prev) => ({ ...prev, fullName: e.target.value }));
            resetFeedback();
          }}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={signUpForm.email}
          onChange={(e) => {
            setSignUpForm((prev) => ({ ...prev, email: e.target.value }));
            resetFeedback();
          }}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Phone number</label>
        <Input
          type="tel"
          placeholder="+201234567890"
          value={signUpForm.phoneNumber}
          onChange={(e) => {
            setSignUpForm((prev) => ({ ...prev, phoneNumber: e.target.value }));
            resetFeedback();
          }}
          required
        />
        <p className="text-xs text-muted-foreground">
          Use an international format (e.g. +20 123 456 7890).
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Gender *</label>
        <select
          value={signUpForm.gender}
          onChange={(e) => {
            setSignUpForm((prev) => ({ ...prev, gender: e.target.value }));
            resetFeedback();
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Riding Experience Level *</label>
        <select
          value={signUpForm.initialTier}
          onChange={(e) => {
            setSignUpForm((prev) => ({ ...prev, initialTier: e.target.value }));
            resetFeedback();
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">Select your level</option>
          <option value="beginner">Beginner (0-1300 points)</option>
          <option value="intermediate">Intermediate (1301-1700 points)</option>
          <option value="advanced">Advanced (1701+ points)</option>
        </select>
        <p className="text-xs text-muted-foreground">
          This determines your starting rank points. You can improve through rides!
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Password</label>
        <PasswordInput
          value={signUpForm.password}
          onChange={(e) => {
            setSignUpForm((prev) => ({ ...prev, password: e.target.value }));
            resetFeedback();
          }}
          placeholder="••••••••"
          required
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters, including uppercase, lowercase, and number.
        </p>
      </div>
      <Button type="submit" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );

  const renderForgotForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-500">
          {successMessage}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email or phone number</label>
        <Input
          type="text"
          placeholder="you@example.com or +201234567890"
          value={forgotIdentifier}
          onChange={(e) => {
            setForgotIdentifier(e.target.value);
            resetFeedback();
          }}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset instructions"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => handleTabChange("signin")}
      >
        Back to sign in
      </Button>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-lg overflow-hidden sm:w-full sm:max-w-lg">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {activeTab === "forgot" ? "Reset your password" : "Welcome to PyraRide"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto overflow-x-hidden pr-2 -mr-2 max-h-[calc(95vh-100px)]">
          {activeTab === "forgot" ? (
            renderForgotForm()
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="space-y-4 mt-4">
                {renderSignInForm()}
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 mt-4 pb-4">
                {renderSignUpForm()}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

