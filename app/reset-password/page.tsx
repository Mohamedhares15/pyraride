"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [password, confirmPassword]);

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
        setError(data.error || "Unable to reset password. Please try again.");
        return;
      }

      setSuccess("Password updated successfully. You can now sign in.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/"); // close page, user can open sign in modal
      }, 2000);
    } catch (err) {
      setError("Unable to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Reset link invalid</h1>
          <p className="text-muted-foreground text-sm">
            The password reset link is missing or invalid. Request a new password reset from the sign-in screen.
          </p>
          <Button asChild>
            <Link href="/">Return to homepage</Link>
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-500">
            {success}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">New password</label>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Enter new password"
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters, including uppercase, lowercase, and a number.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confirm password</label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            placeholder="Re-enter new password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/")}>
          Back to homepage
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <Card className="w-full shadow-xl">
          <CardContent className="space-y-6 pt-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


