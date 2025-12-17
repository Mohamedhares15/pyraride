"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

function ForgotPasswordContent() {
    const router = useRouter();
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
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Unable to send reset email. Please try again.");
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError("Unable to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-6 text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
                    <p className="text-muted-foreground text-sm">
                        We've sent a password reset link to <strong>{email}</strong>.
                        Please check your inbox and spam folder.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/signin">Back to Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">Forgot password?</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/signin")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
            </Button>
        </form>
    );
}

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
                <Card className="w-full shadow-xl">
                    <CardContent>
                        <Suspense
                            fallback={
                                <div className="space-y-4 text-center py-6">
                                    <h1 className="text-2xl font-semibold text-foreground">Loading…</h1>
                                </div>
                            }
                        >
                            <ForgotPasswordContent />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
