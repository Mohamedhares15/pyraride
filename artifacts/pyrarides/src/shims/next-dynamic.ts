import { lazy, ComponentType, ReactNode } from "react";

export default function dynamic<T extends object>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  options?: { ssr?: boolean; loading?: () => ReactNode }
): ComponentType<T> {
  return lazy(loader);
}
