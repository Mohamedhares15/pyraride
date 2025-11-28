"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    // Redirect based on role
    const role = session.user.role;
    
    if (role === "rider") {
      router.push("/dashboard/rider");
    } else if (role === "stable_owner") {
      router.push("/dashboard/stable");
    } else if (role === "admin") {
      router.push("/dashboard/analytics");
    } else {
      // Default fallback
      router.push("/dashboard/rider");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <span className="sr-only">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
      <span className="sr-only">Redirecting to dashboard...</span>
    </div>
  );
}
