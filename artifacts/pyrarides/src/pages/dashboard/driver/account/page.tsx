"use client";

import { useSession, signOut } from "@/shims/next-auth-react";
import { LogOut, User, Mail, Phone, Shield } from "lucide-react";
import NextImage from "@/shims/next-image";
import { useState, useEffect } from "react";

export default function DriverAccountPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchProfile();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  const user = session?.user as any;
  const displayName = profile?.fullName || user?.name || user?.email || "Driver";
  const email = user?.email || "—";
  const phone = profile?.phoneNumber || "—";
  const imageUrl = profile?.profileImageUrl;

  return (
    <div className="flex flex-col w-full min-h-full bg-background text-foreground">
      <div className="px-5 pt-8 pb-5 border-b hairline">
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-1">Driver Portal</p>
        <h1 className="font-display text-2xl font-light">Account</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="flex items-center gap-4 border hairline bg-surface p-5">
          {imageUrl ? (
            <NextImage src={imageUrl} alt="" width={56} height={56} className="object-cover border hairline shrink-0" />
          ) : (
            <div className="w-14 h-14 border hairline bg-surface-elevated flex items-center justify-center shrink-0">
              <span className="font-display text-xl font-light">{displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3 h-3 text-foreground opacity-40" />
              <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Verified Driver</span>
            </div>
          </div>
        </div>

        {/* Info Rows */}
        <div className="border hairline bg-surface divide-y divide-foreground/8">
          {[
            { icon: Mail, label: "Email", value: email },
            { icon: Phone, label: "Phone", value: phone },
            { icon: User, label: "Role", value: "Transport Driver" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center border hairline bg-surface-elevated shrink-0">
                <Icon className="w-4 h-4 text-foreground opacity-40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-luxury text-ink-muted">{label}</p>
                <p className="text-sm text-foreground mt-0.5 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2.5 border border-red-200 bg-red-50 p-4 text-red-600 text-[13px] font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <p className="text-center text-[10px] text-ink-muted tracking-luxury uppercase pt-1">
          PyraRides Driver v1.0
        </p>
      </div>
    </div>
  );
}
