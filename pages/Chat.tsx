"use client";
import { useState, useRef, useEffect } from "react";
import { Reveal } from "@/components/shared/Motion";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { STABLES } from "@/lib/mock-data/seed";

type Msg = { id: string; from: "you" | "them"; text: string; at: string };

const seedThreads = STABLES.slice(0, 5).map((s, i) => ({
  id: s.id,
  name: s.name,
  subtitle: s.location,
  avatar: s.imageUrl,
  unread: i === 0 ? 2 : 0,
  preview: i === 0
    ? "Your sunrise slot is confirmed for Saturday."
    : "Looking forward to seeing you on the plateau.",
  messages: [
    { id: "m1", from: "them" as const, text: `Welcome to ${s.name}. We have your reservation in the ledger.`, at: "09:14" },
    { id: "m2", from: "you" as const, text: "Wonderful — what time should we arrive at the gate?", at: "09:18" },
    { id: "m3", from: "them" as const, text: "5:45 sharp. Tea will be ready when you dismount.", at: "09:21" },
  ] as Msg[],
}));

const Chat = () => {
  const [active, setActive] = useState(seedThreads[0].id);
  const [threads, setThreads] = useState(seedThreads);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = threads.find((t) => t.id === active)!;
  const filtered = threads.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active, current.messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setThreads((prev) => (prev || []).map((t) => t.id === active ? { ...t, messages: [...t.messages, { id: `m-${Date.now()}`, from: "you", text: draft.trim(), at: now }], preview: draft.trim() } : t));
    setDraft("");
    // Mock reply
    setTimeout(() => {
      setThreads((prev) => (prev || []).map((t) => t.id === active ? { ...t, messages: [...t.messages, { id: `r-${Date.now()}`, from: "them", text: "Noted — we will write back within the hour.", at: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }] } : t));
    }, 1100);
  };

  return (
    <div className="min-h-screen pt-28">
      <section className="container py-12 md:py-16 border-b hairline">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Concierge correspondence</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] max-w-3xl text-balance">
            A quiet line to every estate.
          </h1>
        </Reveal>
      </section>

      <section className="container py-10">
        <div className="grid md:grid-cols-12 border hairline min-h-[70vh]">
          {/* Threads */}
          <aside className="md:col-span-4 border-b md:border-b-0 md:border-r hairline flex flex-col">
            <div className="p-5 border-b hairline">
              <label className="flex items-center gap-3 border-b hairline focus-within:border-foreground transition-colors">
                <Search className="size-3.5 text-ink-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search estates"
                  className="flex-1 bg-transparent py-2 text-sm focus:outline-none placeholder:text-ink-muted"
                />
              </label>
            </div>
            <ul className="overflow-y-auto flex-1">
              {(filtered || []).map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActive(t.id)}
                    className={cn(
                      "w-full text-left px-5 py-4 border-b hairline flex gap-4 items-start hover:bg-surface transition-colors",
                      active === t.id && "bg-surface",
                    )}
                  >
                    <span className="size-10 shrink-0 overflow-hidden bg-surface">
                      <img src={t.avatar} alt="" className="h-full w-full object-cover grayscale" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-base truncate">{t.name}</span>
                        {t.unread > 0 && <span className="text-[10px] tracking-luxury uppercase text-foreground tabular-nums">{t.unread} new</span>}
                      </span>
                      <span className="block text-xs text-ink-muted truncate mt-1">{t.preview}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Conversation */}
          <div className="md:col-span-8 flex flex-col">
            <header className="px-7 py-5 border-b hairline flex items-center gap-4">
              <span className="size-10 overflow-hidden bg-surface">
                <img src={current.avatar} alt="" className="h-full w-full object-cover grayscale" />
              </span>
              <div>
                <p className="font-display text-xl leading-tight">{current.name}</p>
                <p className="text-[11px] tracking-luxury uppercase text-ink-muted">{current.subtitle}</p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-7 py-8 space-y-5 bg-surface/30">
              <AnimatePresence initial={false}>
                {(current.messages || []).map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={cn("flex", m.from === "you" ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[75%] px-4 py-3 text-sm leading-relaxed",
                      m.from === "you"
                        ? "bg-foreground text-background"
                        : "bg-background border hairline"
                    )}>
                      <p>{m.text}</p>
                      <p className={cn("mt-1 text-[10px] tracking-luxury uppercase", m.from === "you" ? "text-background/60" : "text-ink-muted")}>{m.at}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form onSubmit={send} className="px-7 py-5 border-t hairline flex items-center gap-4 bg-background">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a note…"
                className="flex-1 bg-transparent border-b hairline py-2 focus:outline-none focus:border-foreground transition-colors"
              />
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
                Send <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
