/**
 * react-router-dom -> next/navigation compatibility shim.
 *
 * Drop-in replacement so elevated pages that import from "react-router-dom"
 * continue to work inside Next.js App Router without modification.
 *
 * Install: add a path alias in tsconfig.json so `react-router-dom` resolves here:
 *   "paths": { "react-router-dom": ["./src/shims/react-router-dom.tsx"] }
 * or via a webpack/turbopack alias in next.config.js.
 */
"use client";
import NextLink from "next/link";
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode, useEffect } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
};
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, children, replace, state: _s, ...rest }, ref) => (
    <NextLink ref={ref as any} href={to} replace={replace} {...rest}>
      {children}
    </NextLink>
  ),
);
Link.displayName = "Link";

type NavLinkProps = Omit<LinkProps, "className" | "children"> & {
  className?: string | ((args: { isActive: boolean; isPending: boolean }) => string);
  end?: boolean;
  children?: ReactNode | ((args: { isActive: boolean; isPending: boolean }) => ReactNode);
};
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, children, end, ...rest }, ref) => {
    const pathname = usePathname() || "/";
    const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
    const ctx = { isActive, isPending: false };
    const cls = typeof className === "function" ? className(ctx) : className;
    const kids = typeof children === "function" ? (children as any)(ctx) : children;
    return (
      <NextLink ref={ref as any} href={to} className={cls} {...rest}>
        {kids}
      </NextLink>
    );
  },
);
NavLink.displayName = "NavLink";

export const Outlet = ({ children }: { children?: ReactNode }) => <>{children}</>;

export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to); else router.push(to);
  }, [to, replace, router]);
  return null;
};

export const useNavigate = () => {
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) window.history.go(to);
      else router.forward();
      return;
    }
    if (opts?.replace) router.replace(to); else router.push(to);
  };
};

export const useLocation = () => {
  const pathname = usePathname() || "/";
  const sp = useNextSearchParams();
  const search = sp?.toString() ? "?" + sp.toString() : "";
  return { pathname, search, hash: typeof window !== "undefined" ? window.location.hash : "", state: null, key: pathname + search };
};

export const useParams = <T extends Record<string, string | undefined>>() =>
  (useNextParams() as unknown) as T;

export const useSearchParams = (): readonly [URLSearchParams, (next: URLSearchParams | Record<string, string> | ((p: URLSearchParams) => URLSearchParams)) => void] => {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const sp = useNextSearchParams();
  const params = new URLSearchParams(sp?.toString() ?? "");
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
