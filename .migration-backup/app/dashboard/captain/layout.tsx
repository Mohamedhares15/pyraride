import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Captain Dashboard - PyraRides",
  description: "Manage your training academy, trainees, and sessions",
};

export default function CaptainDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black text-white p-4 pt-[var(--header-total-height)] 
      pl-[max(1rem,var(--spacing-left-safe))] pr-[max(1rem,var(--spacing-right-safe))] overflow-hidden">
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
