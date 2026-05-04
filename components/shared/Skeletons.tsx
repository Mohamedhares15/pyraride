import { cn } from "@/lib/utils";

/**
 * Luxury skeleton primitives — quiet shimmer on the surface tone,
 * matched to the editorial palette (no neon greys, no rounded blobs).
 *
 * Usage:
 *   <SkeletonLine className="w-2/3" />
 *   <SkeletonBlock aspect="4/5" />
 *   <PageLoader label="Preparing your view…" />
 */

export const SkeletonBase = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative overflow-hidden bg-surface/70",
      "before:absolute before:inset-0 before:-translate-x-full",
      "before:animate-[shimmer_2.2s_var(--ease-luxury)_infinite]",
      "before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent",
      className,
    )}
    {...props}
  />
);

export const SkeletonLine = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SkeletonBase className={cn("h-3 w-full", className)} {...props} />
);

export const SkeletonHeading = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SkeletonBase className={cn("h-10 md:h-14 w-3/4", className)} {...props} />
);

export const SkeletonBlock = ({
  aspect = "4/5",
  className,
  ...props
}: { aspect?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <SkeletonBase
    className={cn("w-full", className)}
    style={{ aspectRatio: aspect }}
    {...props}
  />
);

export const SkeletonAvatar = ({
  size = 40,
  className,
}: { size?: number; className?: string }) => (
  <SkeletonBase
    className={cn("rounded-full", className)}
    style={{ width: size, height: size }}
  />
);

/* ────────────────────────────────────────────────────────────── */
/* Composite skeletons                                            */
/* ────────────────────────────────────────────────────────────── */

export const StableCardSkeleton = () => (
  <div>
    <SkeletonBlock aspect="4/5" />
    <div className="pt-5 space-y-3">
      <SkeletonLine className="h-6 w-2/3" />
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-full mt-3" />
      <SkeletonLine className="w-4/5" />
    </div>
  </div>
);

export const PackageCardSkeleton = () => (
  <div>
    <SkeletonBlock aspect="5/6" />
    <div className="pt-5 flex items-baseline justify-between border-b hairline pb-5">
      <div className="space-y-2 w-1/3">
        <SkeletonLine className="h-2 w-full" />
        <SkeletonLine className="h-7 w-full" />
      </div>
      <SkeletonLine className="h-3 w-24" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <div
    className="grid gap-4 items-center py-5 border-b hairline px-2"
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: cols }).map((_, i) => (
      <SkeletonLine key={i} className={i === 0 ? "w-12" : "w-3/4"} />
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="border hairline p-6 space-y-4">
    <SkeletonLine className="h-2 w-1/3" />
    <SkeletonLine className="h-8 w-2/3" />
    <SkeletonLine className="h-2 w-1/2" />
  </div>
);

/* ────────────────────────────────────────────────────────────── */
/* Page-level loaders                                             */
/* ────────────────────────────────────────────────────────────── */

/**
 * Editorial full-page loader. Shown while auth resolves or
 * a route's loader is pending. Mirrors the homepage rhythm so
 * the transition feels intentional, not blank.
 */
export const PageLoader = ({
  label = "One moment",
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "dashboard" | "list";
}) => {
  if (variant === "dashboard") {
    return (
      <div className="container pt-32 pb-24 min-h-[60vh]">
        <div className="space-y-3 max-w-xl">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">
            {label}…
          </p>
          <SkeletonHeading />
          <SkeletonLine className="w-1/2" />
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-12 space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={5} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="container pt-40 pb-32">
        <div className="space-y-3 max-w-xl mb-16">
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted">
            {label}…
          </p>
          <SkeletonHeading />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StableCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-40 pb-32 min-h-[60vh]">
      <div className="space-y-4 max-w-xl">
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted">
          {label}…
        </p>
        <SkeletonHeading />
        <SkeletonLine className="w-1/2" />
        <SkeletonLine className="w-2/3" />
      </div>
    </div>
  );
};

export default PageLoader;
