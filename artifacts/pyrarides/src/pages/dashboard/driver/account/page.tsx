"use client";

import { useSession, signOut } from "@/shims/next-auth-react";
import { Loader2, LogOut, User, Mail, Phone, Shield } from "lucide-react";
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
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const user = session?.user as any;
  const displayName = profile?.fullName || user?.name || user?.email || "Driver";
  const email = user?.email || "—";
  const phone = profile?.phoneNumber || "—";
  const imageUrl = profile?.profileImageUrl;

  return (
    <div className="flex flex-col w-full min-h-full">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[22px] font-bold tracking-tight">Account</h1>
      </div>

      <div className="flex-1 px-4 pb-6 space-y-4">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
          {imageUrl ? (
<NextImage src={imageUrl} alt="" width={56} height={56} className="rounded-full object-cover ring-2 ring-[#D4AF37]/30 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center shrink-0 ring-2 ring-[#D4AF37]/20">
              <span className="text-xl font-bold text-[#D4AF37]">{displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold truncate">{displayName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider">Verified Driver</span>
            </div>
          </div>
        </div>

        {/* Info Rows */}
        <div className="rounded-2xl bg-[#141414] border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">Email</p>
              <p className="text-[13px] text-white/80 truncate mt-0.5">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">Phone</p>
              <p className="text-[13px] text-white/80 mt-0.5">{phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">Role</p>
              <p className="text-[13px] text-white/80 mt-0.5">Transport Driver</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center gap-2.5 w-full p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-[13px] hover:bg-red-500/20 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <p className="text-center text-[10px] text-white/20 pt-2 tracking-wider uppercase">
          PyraRides Driver v1.0
        </p>
      </div>
    </div>
  );
}
