import { useLocation, useParams as wouterUseParams } from "wouter";

export function useRouter() {
  const [, navigate] = useLocation();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function usePathname(): string {
  const [location] = useLocation();
  return location;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return (wouterUseParams() ?? {}) as T;
}

export function notFound(): never {
  throw new Error("Not found");
}

export function redirect(url: string): never {
  window.location.href = url;
  throw new Error("Redirect");
}
