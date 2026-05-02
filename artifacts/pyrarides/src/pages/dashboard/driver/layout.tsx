"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "@/shims/next-auth-react";
import { useRouter, usePathname } from '@/shims/next-navigation';
import { Loader2 } from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";

const NAV_ITEMS = [
  {
    href: "/dashboard/driver",
    label: "Radar",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/driver/active",
    label: "Active",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    href: "/dashboard/driver/history",
    label: "History",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/driver/account",
    label: "Account",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function DriverDashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "driver") {
      router.replace("/");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user?.role !== "driver") {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/dashboard/driver") return pathname === "/dashboard/driver";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0A0A0A] text-white">
      {/* ─── Top Status Bar ─── */}
      <header 
        className="flex shrink-0 items-center justify-between bg-[#0A0A0A] px-5 border-b border-white/[0.06] pt-[max(0.75rem,var(--sat))] pb-3"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C]">
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-none tracking-tight">PyraRides</p>
            <p className="mt-0.5 text-[10px] font-medium text-[#D4AF37] tracking-[0.15em] uppercase">Driver</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 tracking-wide uppercase">Online</span>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>

      {/* ─── Bottom Navigation Dock ─── */}
      <nav className="shrink-0 flex items-end justify-around bg-[#0A0A0A] border-t border-white/[0.06] px-2 pt-1.5 pb-[max(0.5rem,var(--sab))]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 ${
                active
                  ? "text-[#D4AF37]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <div className={`relative ${active ? "" : ""}`}>
                {active && (
                  <div className="absolute -inset-2 rounded-xl bg-[#D4AF37]/10 blur-sm" />
                )}
                <div className="relative">{item.icon}</div>
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-[#D4AF37]" : ""}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
