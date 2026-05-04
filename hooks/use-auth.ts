import { useEffect, useState, useCallback } from "react";
import type { User, UserRole } from "@/lib/types";
import { DEMO_USERS } from "@/lib/mock-data/seed";

const STORAGE_KEY = "pyrarides.auth.user.v1";

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function writeUser(u: User | null) {
  if (typeof window === "undefined") return;
  if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else window.localStorage.removeItem(STORAGE_KEY);
  // Notify same-tab listeners
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readUser());
    setIsLoading(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setUser(readUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback(async (_identifier: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 350));
    const next = DEMO_USERS.rider;
    writeUser(next);
    setUser(next);
    return next;
  }, []);

  const signInAs = useCallback(async (role: UserRole) => {
    await new Promise((r) => setTimeout(r, 200));
    const next = DEMO_USERS[role] ?? DEMO_USERS.rider;
    writeUser(next);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(async (data: { fullName: string; email: string; phoneNumber?: string }) => {
    await new Promise((r) => setTimeout(r, 400));
    const next: User = {
      ...DEMO_USERS.rider,
      id: `u-${Date.now()}`,
      fullName: data.fullName || DEMO_USERS.rider.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      rankPoints: 0,
      currentLeague: "wood",
      isTrustedRider: false,
    };
    writeUser(next);
    setUser(next);
    return next;
  }, []);

  const sendPasswordReset = useCallback(async (_email: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true as const };
  }, []);

  const resetPassword = useCallback(async (_token: string, _newPassword: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    writeUser(null);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    signIn,
    signInAs,
    signUp,
    signOut,
    sendPasswordReset,
    resetPassword,
    isAuthenticated: !!user,
  };
}
