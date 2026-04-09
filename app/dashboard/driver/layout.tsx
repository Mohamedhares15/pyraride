import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/shared/Navigation"; // Standard nav logic can be suppressed here if needed

export default async function DriverDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "driver") {
    redirect("/");
  }

  // Pure PWA layout. Full screen, no scrolling on the body level.
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0A0A0A] text-white">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#121212] px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(218,165,32)]/20">
            <span className="text-xs font-bold text-[rgb(218,165,32)]">D</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">PyraRides</h1>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[#D4AF37]">Driver Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-green-500">Online</span>
        </div>
      </header>

      {/* Main Content Area (Scrollable internally) */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Mobile PWA Navigation Dock */}
      <nav className="absolute bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-white/10 bg-[#121212]/95 backdrop-blur-xl pb-safe">
        <a href="/dashboard/driver" className="flex flex-col items-center gap-1 p-2 text-[rgb(218,165,32)]">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium">Radar</span>
        </a>
        <a href="/dashboard/driver/active" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-medium">Active</span>
        </a>
        <a href="/dashboard/driver/history" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium">History</span>
        </a>
        <a href="/dashboard/driver/account" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-colors">
           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </a>
      </nav>
    </div>
  );
}
