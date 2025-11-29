"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComingSoon({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isComingSoon, setIsComingSoon] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if coming soon mode is enabled
    fetch("/api/coming-soon/status")
      .then((res) => res.json())
      .then((data) => {
        setIsComingSoon(data.enabled || false);
      })
      .catch(() => setIsComingSoon(false));
  }, []);

  // Don't show overlay for admins or if coming soon is disabled
  if (status === "loading" || isComingSoon === null) {
    return <>{children}</>;
  }

  // Admins can always see the site
  if (session?.user?.role === "admin") {
    return <>{children}</>;
  }

  // If coming soon is disabled, show normal site
  if (!isComingSoon) {
    return <>{children}</>;
  }

  // Show coming soon overlay with website's aesthetic
  return (
    <>
      <div className="relative min-h-screen">
        {/* Blurred background - matches website's papyrus white theme */}
        <div className="filter blur-[2px] pointer-events-none opacity-60">{children}</div>

        {/* Coming soon overlay - matches website's minimalist design */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-papyrus-white/95 backdrop-blur-md">
          <div className="max-w-lg w-full mx-4 relative">
            {/* Main Card - matches website's rounded-5xl cards */}
            <div className="bg-white rounded-5xl shadow-2xl p-8 md:p-12 text-center space-y-8 border border-border/50">
              {/* Logo/Brand - matches website styling */}
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-bold text-obsidian tracking-tight">
                  PyraRide
                </h1>
                <div className="w-24 h-1 bg-nile-blue mx-auto rounded-full"></div>
              </div>

              {/* Coming Soon Message */}
              <div className="space-y-6">
                <div className="text-7xl">🐴</div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-obsidian mb-3">
                    Coming Soon!
                  </h2>
                  <p className="text-lg text-foreground/80 max-w-md mx-auto leading-relaxed">
                    We&apos;re putting the finishing touches on an amazing experience for you.
                  </p>
                </div>
                <p className="text-base text-muted-foreground">
                  Sign up now and we&apos;ll notify you by email as soon as we&apos;re ready to launch!
                </p>
              </div>

              {/* Sign Up Button for unauthenticated users */}
              {status === "unauthenticated" && (
                <div className="pt-4">
                  <Button
                    asChild
                    className="rounded-full px-8 py-6 text-lg font-semibold bg-nile-blue hover:bg-nile-blue/90 text-white shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                </div>
              )}

              {/* User Info for authenticated users */}
              {session?.user && (
                <div className="pt-6 border-t border-border">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="text-base font-semibold text-obsidian">
                      {session.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground pt-2">
                      ✓ You&apos;ll receive an email when we launch
                    </p>
                  </div>
                </div>
              )}

              {/* Subtle decorative accent */}
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-accent/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-nile-blue/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}

