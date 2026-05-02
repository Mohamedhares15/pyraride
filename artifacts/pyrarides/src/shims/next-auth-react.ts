import { useState, useEffect } from "react";

export interface Session {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    [key: string]: any;
  };
  expires?: string;
}

let cachedSession: { data: Session | null; status: string } | null = null;
const listeners: Array<() => void> = [];

async function fetchSession(): Promise<Session | null> {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ? data : null;
  } catch {
    return null;
  }
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(cachedSession?.data ?? null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    cachedSession ? (cachedSession.data ? "authenticated" : "unauthenticated") : "loading"
  );

  useEffect(() => {
    if (cachedSession) {
      setSession(cachedSession.data);
      setStatus(cachedSession.data ? "authenticated" : "unauthenticated");
      return;
    }

    fetchSession().then((data) => {
      cachedSession = { data, status: data ? "authenticated" : "unauthenticated" };
      setSession(data);
      setStatus(data ? "authenticated" : "unauthenticated");
      listeners.forEach((fn) => fn());
    });
  }, []);

  return { data: session, status };
}

export async function signOut(options?: { callbackUrl?: string }) {
  cachedSession = null;
  await fetch("/api/auth/signout", { method: "POST" });
  window.location.href = options?.callbackUrl ?? "/";
}

export async function signIn(
  provider: string,
  options?: { email?: string; password?: string; redirect?: boolean; callbackUrl?: string }
) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  const data = await response.json();
  cachedSession = null;
  if (options?.redirect !== false && response.ok) {
    window.location.href = options?.callbackUrl ?? "/";
  }
  return { ok: response.ok, error: data.error };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return children as any;
}
