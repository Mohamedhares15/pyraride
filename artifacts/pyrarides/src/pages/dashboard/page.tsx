"use client";

import { useSession } from "@/shims/next-auth-react";
import { useRouter } from '@/shims/next-navigation';
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

    const role = session.user?.role;

    if (role === "rider") {
      router.push("/dashboard/rider");
    } else if (role === "stable_owner") {
      router.push("/dashboard/stable");
    } else if (role === "captain") {
      router.push("/dashboard/captain");
    } else if (role === "admin") {
      router.push("/dashboard/analytics");
    } else if (role === "cx_media") {
      router.push("/dashboard/cx-media");
    } else if (role === "driver") {
      router.push("/dashboard/driver");
    } else {
      router.push("/dashboard/rider");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Loading dashboard…</span>
      </div>
    </div>
  );
}
