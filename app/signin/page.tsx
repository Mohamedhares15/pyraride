"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthModal from "@/components/shared/AuthModal";
import Navbar from "@/components/shared/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // If already signed in, redirect to callback URL
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  // Handle redirect after successful sign-in
  useEffect(() => {
    if (status === "authenticated" && session && !isOpen) {
      router.push(callbackUrl);
    }
  }, [status, session, isOpen, callbackUrl, router]);

  // Don't render anything while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If already authenticated, don't show the page (redirect is happening)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border bg-card p-8 shadow-lg">
            <AuthModal 
              open={isOpen} 
              onOpenChange={(open) => {
                setIsOpen(open);
                // If closing without authentication, go to home
                if (!open) {
                  router.push("/");
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

