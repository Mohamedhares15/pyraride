"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    // Redirect based on user role
    if (session.user.role === "rider") {
      router.push("/dashboard/rider");
    } else if (session.user.role === "stable_owner") {
      router.push("/dashboard/stable");
    } else if (session.user.role === "admin") {
      router.push("/dashboard/stable"); // Default to stable for now
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

