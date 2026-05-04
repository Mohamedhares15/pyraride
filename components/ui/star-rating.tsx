import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  outOf?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({ value, outOf = 5, size = "md", showValue = false, className }: Props) {
  const sizeClass = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: outOf }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              className={cn(sizeClass, filled ? "fill-accent text-accent" : "text-hairline")}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {showValue && <span className="text-xs ink-muted tabular-nums">{value.toFixed(1)}</span>}
    </div>
  );
}
