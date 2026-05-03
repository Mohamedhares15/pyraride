/**
 * Minimal `@tanstack/react-router` shim covering the only symbol used
 * by elevated pages outside router-compat: `useNavigate`.
 *
 * Add a tsconfig path or bundler alias:
 *   "paths": { "@tanstack/react-router": ["./src/shims/tanstack-react-router.tsx"] }
 */
"use client";
import { useRouter } from "next/navigation";

export const useNavigate = () => {
  const router = useRouter();
  return ({ to, replace }: { to: string; replace?: boolean }) => {
    if (replace) router.replace(to); else router.push(to);
  };
};
export { default as Link } from "next/link";
