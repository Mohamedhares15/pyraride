import { lazy, ComponentType, ReactNode } from "react";

export default function dynamic<T extends object>(
  loader: () => Promise<{ default: ComponentType<T> } | ComponentType<T>>,
  options?: { ssr?: boolean; loading?: () => ReactNode }
): ComponentType<T> {
  return lazy(() =>
    loader().then((mod) => {
      if ("default" in mod) return mod as { default: ComponentType<T> };
      return { default: mod as ComponentType<T> };
    })
  );
}
