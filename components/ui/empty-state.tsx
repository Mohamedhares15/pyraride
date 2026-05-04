import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Convenience: render a primary CTA link without passing custom JSX. */
  cta?: { label: string; to: string };
  className?: string;
}

export function EmptyState({ icon, eyebrow, title, description, action, cta, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-20 border hairline bg-surface-elevated/30",
        className,
      )}
    >
      {icon && (
        <div className="mb-6 flex size-14 items-center justify-center rounded-full border hairline text-ink-muted">
          {icon}
        </div>
      )}
      {eyebrow && (
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">{eyebrow}</p>
      )}
      <h3 className="font-display text-3xl md:text-4xl leading-tight text-balance">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-sm text-ink-soft text-pretty">{description}</p>
      )}
      {(action || cta) && (
        <div className="mt-8 flex items-center gap-3">
          {cta && (
            <Link
              to={cta.to}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase hover:opacity-90 transition-opacity"
            >
              {cta.label} <ArrowUpRight className="size-3.5" />
            </Link>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
