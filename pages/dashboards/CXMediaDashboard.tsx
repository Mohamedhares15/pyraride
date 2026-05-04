import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, MessageSquare, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// CX Media dashboard — Gallery curation + Support tickets
// ─────────────────────────────────────────────────────────────────────────────

const ASSETS = [
  { id: "a1", src: gallery1, photographer: "Reem Hassan", session: "Devereux · Sunrise", status: "pending" },
  { id: "a2", src: gallery2, photographer: "Reem Hassan", session: "Devereux · Sunrise", status: "approved" },
  { id: "a3", src: gallery3, photographer: "Idris Faruq", session: "Castellanos family", status: "pending" },
  { id: "a4", src: gallery4, photographer: "Idris Faruq", session: "Castellanos family", status: "approved" },
  { id: "a5", src: gallery5, photographer: "Mei Lin",     session: "Hayashi · Twilight", status: "rejected" },
  { id: "a6", src: gallery6, photographer: "Mei Lin",     session: "Hayashi · Twilight", status: "approved" },
] as const;

const TICKETS = [
  { id: "t1", guest: "Yasmine Devereux",    subject: "Photographer release form",    priority: "low",    age: "2h", status: "open" },
  { id: "t2", guest: "Castellanos family",  subject: "Re-shoot request — group portrait", priority: "high", age: "5h", status: "open" },
  { id: "t3", guest: "Hayashi",             subject: "Album not received",           priority: "high",   age: "1d", status: "open" },
  { id: "t4", guest: "Lindqvist",           subject: "Print sizes",                  priority: "low",    age: "3d", status: "resolved" },
];

const CXMediaDashboard = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const filtered = filter === "all" ? ASSETS : ASSETS.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen pt-28">
      <div className="container border-b hairline pb-6">
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">CX Media · Curator</p>
        <h1 className="font-display text-4xl md:text-5xl leading-none">Gallery & guest care.</h1>
      </div>

      <div className="container py-12 pb-32 space-y-16">
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
          {[
            { label: "Pending review",      value: ASSETS.filter((a) => a.status === "pending").length,  icon: ImageIcon },
            { label: "Approved · 30d",      value: 142, icon: Camera },
            { label: "Open tickets",         value: TICKETS.filter((t) => t.status === "open").length,    icon: MessageSquare },
            { label: "High priority",        value: TICKETS.filter((t) => t.priority === "high" && t.status === "open").length, icon: AlertCircle },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <div className="bg-background p-8">
                <s.icon className="size-4 text-ink-muted mb-4" />
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.label}</p>
                <p className="mt-3 font-display text-4xl">{s.value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Gallery moderation */}
        <Reveal>
          <div className="flex items-end justify-between border-b hairline pb-5 mb-8">
            <h2 className="font-display text-3xl md:text-4xl">Gallery queue</h2>
            <ul className="flex gap-6">
              {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                <li key={f}>
                  <button
                    onClick={() => setFilter(f)}
                    className={cn(
                      "relative text-[11px] tracking-luxury uppercase pb-1 transition-colors",
                      filter === f ? "text-foreground" : "text-ink-muted hover:text-foreground",
                    )}
                  >
                    {f}
                    {filter === f && <motion.span layoutId="cx-tab" className="absolute left-0 right-0 -bottom-px h-px bg-foreground" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 gap-4" gap={0.06}>
            {filtered.map((a) => (
              <StaggerItem key={a.id}>
                <article className="border hairline bg-surface-elevated/40 group overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                    <motion.img src={a.src} alt={a.session} className="h-full w-full object-cover" whileHover={{ scale: 1.04 }} transition={{ duration: 1.2, ease: easeLuxury }} />
                    <span className={cn(
                      "absolute top-3 left-3 px-3 py-1 text-[10px] tracking-luxury uppercase",
                      a.status === "approved" ? "bg-foreground text-background" :
                      a.status === "rejected" ? "bg-background/85 text-ink-muted line-through" :
                                                "bg-background/85 text-foreground",
                    )}>
                      {a.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{a.photographer}</p>
                    <p className="font-display text-lg leading-tight mt-1">{a.session}</p>
                    {a.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-foreground text-background text-[10px] tracking-[0.18em] uppercase">Approve</button>
                        <button className="flex-1 px-3 py-2 border hairline text-[10px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Reject</button>
                      </div>
                    )}
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Reveal>

        {/* Tickets */}
        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl md:text-4xl mb-6 border-b hairline pb-5">Support tickets</h2>
          <div className="border hairline">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b hairline bg-surface/40 text-[10px] tracking-luxury uppercase text-ink-muted">
              <div className="col-span-3">Guest</div>
              <div className="col-span-5">Subject</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-1">Age</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
            {TICKETS.map((t) => (
              <div key={t.id} className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 border-b hairline last:border-b-0 hover:bg-surface/50 transition-colors items-center">
                <div className="md:col-span-3 font-display text-xl">{t.guest}</div>
                <div className="md:col-span-5 text-sm text-ink-soft">{t.subject}</div>
                <div className="md:col-span-2 text-[11px] tracking-luxury uppercase text-foreground">
                  <span className={cn("inline-block size-1.5 rounded-full mr-2", t.priority === "high" ? "bg-foreground" : "bg-ink-muted")} />
                  {t.priority}
                </div>
                <div className="md:col-span-1 text-xs text-ink-muted">{t.age}</div>
                <div className="md:col-span-1 md:text-right text-[11px] tracking-luxury uppercase text-ink-muted">{t.status}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default CXMediaDashboard;
