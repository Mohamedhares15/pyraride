import { cn } from "@/lib/utils";

export const Stars = ({
  value,
  outOf = 5,
  size = "sm",
  interactive = false,
  onChange,
}: {
  value: number;
  outOf?: number;
  size?: "xs" | "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (v: number) => void;
}) => {
  const dim = { xs: "size-2.5", sm: "size-3", md: "size-4", lg: "size-5" }[size];
  return (
    <div className="inline-flex items-center gap-1" role="img" aria-label={`${value} out of ${outOf}`}>
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn("p-0 leading-none", interactive && "cursor-pointer hover:scale-110 transition-transform")}
            aria-label={`${i + 1} star`}
          >
            <svg viewBox="0 0 24 24" className={cn(dim, "fill-none stroke-current text-foreground")} strokeWidth={1}>
              <path d="M12 3.5l2.6 5.7 6.2.7-4.6 4.3 1.3 6.1L12 17.4 6.5 20.3l1.3-6.1L3.2 9.9l6.2-.7L12 3.5z"
                fill={filled ? "currentColor" : "transparent"} />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
