"use client";
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode, useEffect, useState } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; replace?: boolean; state?: unknown; children?: ReactNode };
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, children, replace, state: _s, ...rest }, ref) => (
  <NextLink ref={ref as any} href={to} replace={replace} {...rest}>{children}</NextLink>
));
Link.displayName = "Link";

type NavLinkProps = Omit<LinkProps, "className" | "children"> & {
  className?: string | ((args: { isActive: boolean; isPending: boolean }) => string);
  end?: boolean;
  children?: ReactNode | ((args: { isActive: boolean; isPending: boolean }) => ReactNode);
};
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(({ to, className, children, end, ...rest }, ref) => {
  const pathname = usePathname() || "/";
  const isActive = end ? pathname === to : pathname === to || pathname?.startsWith(to + "/");
  const ctx = { isActive, isPending: false };
  const cls = typeof className === "function" ? className(ctx) : className;
  const kids = typeof children === "function" ? (children as any)(ctx) : children;
  return <NextLink ref={ref as any} href={to} className={cls} {...rest}>{kids}</NextLink>;
});
NavLink.displayName = "NavLink";

export const Outlet = ({ children }: { children?: ReactNode }) => <>{children}</>;

export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const router = useRouter();
  useEffect(() => { if (replace) router.replace(to); else router.push(to); }, [to, replace, router]);
  return null;
};

export const useNavigate = () => {
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") { if (to < 0) window.history.go(to); else router.forward(); return; }
    if (opts?.replace) router.replace(to as string); else router.push(to as string);
  };
};

export const useLocation = () => {
  const pathname = usePathname() || "/";
  const [search, setSearch] = useState("");
  const [hash, setHash] = useState("");
  useEffect(() => {
    setSearch(window.location.search);
    setHash(window.location.hash);
  }, [pathname]);
  return { pathname, search, hash, state: null, key: pathname + search };
};

// Reads dynamic segments from the URL pathname - avoids useNextParams() which
// calls React.use() internally and crashes in Next.js 14
export const useParams = <T extends Record<string, string | undefined>>(): T => {
  const pathname = usePathname() || "/";
  const result: Record<string, string> = {};
  const routePatterns: { pattern: RegExp; keys: string[] }[] = [
    { pattern: /^\/stables\/([^/]+)/, keys: ["id", "stableId"] },
    { pattern: /^\/packages\/([^/]+)/, keys: ["id"] },
    { pattern: /^\/training\/([^/]+)\/checkout/, keys: ["academyId", "id"] },
    { pattern: /^\/training\/([^/]+)/, keys: ["academyId", "id"] },
    { pattern: /^\/users\/([^/]+)/, keys: ["id"] },
    { pattern: /^\/s\/([^/]+)/, keys: ["stableId", "id"] },
    { pattern: /^\/checkout\/package\/([^/]+)/, keys: ["id"] },
  ];
  for (const { pattern, keys } of routePatterns) {
    const match = pathname.match(pattern);
    if (match) {
      for (const k of keys) result[k] = match[1];
      break;
    }
  }
  return result as T;
};

// Avoids useNextSearchParams() which calls React.use() internally in Next 14
export const useSearchParams = (): readonly [URLSearchParams, (next: URLSearchParams | Record<string, string> | ((p: URLSearchParams) => URLSearchParams)) => void] => {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [search, setSearch] = useState("");
  useEffect(() => { setSearch(window.location.search); }, [pathname]);
  const params = new URLSearchParams(search);
  const set = (next: any) => {
    let out: URLSearchParams;
    if (typeof next === "function") out = next(params);
    else if (next instanceof URLSearchParams) out = next;
    else out = new URLSearchParams(next);
    const qs = out.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };
  return [params, set] as const;
};
