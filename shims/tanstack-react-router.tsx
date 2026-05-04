"use client";
import { useRouter as useNextRouter } from "next/navigation";
import Link from "next/link";

export const useNavigate = () => {
  const router = useNextRouter();
  return ({ to, replace }: { to: string; replace?: boolean }) => {
    const target = typeof to === 'string' ? to : (to as any).to;
    if (replace) router.replace(target); else router.push(target);
  };
};

export const useRouter = () => {
  const router = useNextRouter();
  return {
    history: { go: (n: number) => window.history.go(n) },
    navigate: (to: string) => router.push(to),
    state: {
      location: typeof window !== "undefined" ? window.location : { pathname: "/", search: "", hash: "" },
      matches: [] as any[]
    }
  };
};

export { Link };
