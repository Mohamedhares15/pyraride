"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// Dynamically import AuthModal to avoid SSR issues
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });

export default function ComingSoon({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isComingSoon, setIsComingSoon] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if coming soon mode is enabled
    fetch("/api/coming-soon/status")
      .then((res) => res.json())
      .then((data) => {
        setIsComingSoon(data.enabled || false);
      })
      .catch(() => setIsComingSoon(false));
  }, []);

  // Auto-open sign-in modal for unauthenticated users in coming soon mode
  useEffect(() => {
    if (isComingSoon && status === "unauthenticated") {
      setShowAuthModal(true);
    }
  }, [isComingSoon, status]);

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

  // Show coming soon overlay
  return (
    <>
      <div className="relative min-h-screen">
        {/* Blurred background */}
        <div className="filter blur-sm pointer-events-none">{children}</div>

        {/* Coming soon overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-w-md w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl p-8 text-center space-y-6 backdrop-blur-md relative">
            {/* Logo/Brand */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PyraRide
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Coming Soon Message */}
            <div className="space-y-4">
              <div className="text-6xl">🚀</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coming Soon!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                We&apos;re putting the finishing touches on something amazing.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                We&apos;ll notify you by email as soon as we&apos;re ready to launch!
              </p>
            </div>

            {/* User Info */}
            {session?.user && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Signed in as <span className="font-semibold">{session.user.email}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  You&apos;ll receive an email when we launch
                </p>
              </div>
            )}

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal for unauthenticated users */}
      {status === "unauthenticated" && (
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      )}
    </>
  );
}

