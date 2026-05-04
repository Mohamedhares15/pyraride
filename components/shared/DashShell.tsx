import { type ReactNode } from "react";
import { Reveal } from "@/components/shared/Motion";

export const DashShell = ({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) => (
  <div className="container pt-32 pb-32 min-h-screen">
    <Reveal>
      <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">{eyebrow}</p>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-ink-soft text-pretty">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
    </Reveal>
    <div className="mt-16">{children}</div>
  </div>
);

export const StatGrid = ({ stats }: { stats: { label: string; value: string | number; hint?: string }[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border hairline">
    {stats.map((s) => (
      <div key={s.label} className="bg-background p-7">
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.label}</p>
        <p className="mt-3 font-display text-4xl tabular-nums">{s.value}</p>
        {s.hint && <p className="mt-2 text-[11px] text-ink-muted">{s.hint}</p>}
      </div>
    ))}
  </div>
);

export const SectionTitle = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="flex items-end justify-between mb-8 border-b hairline pb-4">
    <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
    {hint && <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{hint}</p>}
  </div>
);

export const DashTable = <T,>({
  rows,
  columns,
  empty = "Nothing to show.",
  emptyAction,
}: {
  rows: T[];
  columns: { key: string; header: string; cell: (row: T) => ReactNode; width?: string }[];
  empty?: string;
  emptyAction?: ReactNode;
}) => {
  if (rows.length === 0) {
    return (
      <div className="border hairline p-12 text-center bg-surface-elevated/30">
        <p className="text-sm text-ink-muted">{empty}</p>
        {emptyAction && <div className="mt-6 flex justify-center">{emptyAction}</div>}
      </div>
    );
  }
  return (
    <div className="border hairline overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b hairline bg-surface-elevated/40">
            {columns.map((c) => (
              <th key={c.key} className={`text-left px-5 py-4 text-[10px] tracking-luxury uppercase text-ink-muted font-normal ${c.width ?? ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b hairline last:border-0 hover:bg-surface-elevated/30 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-5 py-4 align-top">{c.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Pill = ({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger"; children: ReactNode }) => {
  const cls =
    tone === "success" ? "bg-foreground text-background" :
    tone === "warning" ? "bg-accent/30 text-foreground" :
    tone === "danger"  ? "bg-destructive/15 text-destructive" :
                          "bg-surface-elevated text-ink-soft";
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-luxury uppercase ${cls}`}>{children}</span>;
};
