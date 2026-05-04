import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Send } from "lucide-react";
import RoleGuard from "@/components/shared/RoleGuard";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle, StatGrid, Pill } from "@/components/shared/DashShell";
import { GALLERY_ITEMS } from "@/lib/mock-data/seed";
import { undoableAction } from "@/lib/optimistic";

export const CXGalleryPage = () => {
  const [items, setItems] = useState(GALLERY_ITEMS);
  const pending = items.filter((g) => g.status === "pending");

  const decide = (id: string, status: "approved" | "rejected") => {
    const prev = items;
    const next = items.map((g) => (g.id === id ? { ...g, status } : g));
    undoableAction({
      message: status === "approved" ? "Photo approved." : "Photo rejected.",
      apply: () => setItems(next),
      revert: () => setItems(prev),
      commit: () => new Promise((r) => setTimeout(r, 200)),
    });
  };

  return (
    <RoleGuard allow={["cx_media"]}>
      <SubNav kind="cx" />
      <DashShell eyebrow="CX Media" title="Gallery moderation" subtitle="Approve or reject rider-submitted photos.">
        <StatGrid stats={[
          { label: "Pending", value: pending.length },
          { label: "Approved", value: items.filter((g) => g.status === "approved").length },
          { label: "Rejected", value: items.filter((g) => g.status === "rejected").length },
          { label: "Total", value: items.length },
        ]} />

        <div className="mt-12">
          <SectionTitle title="Awaiting review" hint={`${pending.length} pending`} />
          {pending.length === 0 ? (
            <div className="border hairline p-16 text-center bg-surface-elevated/30">
              <div className="mx-auto mb-5 size-14 inline-flex items-center justify-center rounded-full border hairline text-ink-muted">
                <Check className="size-5" />
              </div>
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-3">All clear</p>
              <h3 className="font-display text-3xl">The queue is quiet.</h3>
              <p className="mt-3 max-w-sm mx-auto text-sm text-ink-soft">
                Every submitted photo has been reviewed. New uploads will appear here as riders share them.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map((g) => (
                <article key={g.id} className="border hairline overflow-hidden bg-surface-elevated/30">
                  <div className="aspect-[4/5] overflow-hidden bg-surface">
                    <img src={g.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{g.riderName}</p>
                    <p className="mt-1 font-display text-lg">{g.caption}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => decide(g.id, "approved")} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
                        <Check className="size-3.5" /> Approve
                      </button>
                      <button onClick={() => decide(g.id, "rejected")} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-destructive hover:text-background hover:border-destructive transition-colors">
                        <X className="size-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </DashShell>
    </RoleGuard>
  );
};

type Ticket = {
  id: string; subject: string; rider: string; status: "open" | "pending" | "resolved";
  priority: "low" | "med" | "high"; opened: Date; lastMessage: string;
};

const TICKETS: Ticket[] = [
  { id: "t1", subject: "Rescheduling sunrise ride", rider: "Yasmine A.", status: "open", priority: "high", opened: new Date(Date.now() - 86400000), lastMessage: "Could we move tomorrow's ride to next week?" },
  { id: "t2", subject: "Photo set not received", rider: "Omar K.", status: "pending", priority: "med", opened: new Date(Date.now() - 86400000 * 2), lastMessage: "It's been 5 days since the ride." },
  { id: "t3", subject: "Refund request", rider: "Lara T.", status: "open", priority: "high", opened: new Date(Date.now() - 86400000 * 3), lastMessage: "We had to cancel due to weather." },
  { id: "t4", subject: "Question about Cercle", rider: "Hassan M.", status: "resolved", priority: "low", opened: new Date(Date.now() - 86400000 * 5), lastMessage: "Thank you for the explanation." },
];

export const CXSupportPage = () => {
  const [active, setActive] = useState<Ticket>(TICKETS[0]);
  const [reply, setReply] = useState("");

  return (
    <RoleGuard allow={["cx_media"]}>
      <SubNav kind="cx" />
      <DashShell eyebrow="CX Media" title="Support" subtitle="Open conversations with riders.">
        <div className="grid lg:grid-cols-3 gap-6 min-h-[60vh]">
          <aside className="border hairline divide-y hairline">
            {TICKETS.map((t) => (
              <button key={t.id} onClick={() => setActive(t)} className={`w-full text-left p-5 transition-colors ${active.id === t.id ? "bg-surface-elevated" : "hover:bg-surface-elevated/40"}`}>
                <div className="flex justify-between items-start gap-3">
                  <p className="font-display text-base leading-tight">{t.subject}</p>
                  <Pill tone={t.priority === "high" ? "danger" : t.priority === "med" ? "warning" : "neutral"}>{t.priority}</Pill>
                </div>
                <p className="mt-1 text-[11px] tracking-luxury uppercase text-ink-muted">{t.rider}</p>
                <p className="mt-2 text-xs text-ink-soft truncate">{t.lastMessage}</p>
              </button>
            ))}
          </aside>

          <section className="lg:col-span-2 border hairline flex flex-col">
            <div className="p-6 border-b hairline">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{active.rider}</p>
                  <h2 className="mt-1 font-display text-3xl">{active.subject}</h2>
                </div>
                <Pill tone={active.status === "open" ? "warning" : active.status === "pending" ? "neutral" : "success"}>{active.status}</Pill>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-auto bg-surface-elevated/20">
              <div className="max-w-md border hairline bg-background p-4">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-1">{active.rider}</p>
                <p className="text-sm text-ink-soft">{active.lastMessage}</p>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; toast.success("Reply sent."); setReply(""); }} className="p-4 border-t hairline flex gap-3">
              <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="flex-1 bg-transparent border-b hairline pb-2 focus:outline-none focus:border-foreground" />
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase"><Send className="size-3.5" /> Send</button>
            </form>
          </section>
        </div>
      </DashShell>
    </RoleGuard>
  );
};

export const CXOverviewWrapper = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allow={["cx_media"]}>
    <SubNav kind="cx" />
    {children}
  </RoleGuard>
);
