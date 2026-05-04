"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

type Msg = { id: string; from: "you" | "concierge"; text: string; time: string };

const INITIAL: Msg[] = [
  { id: "m1", from: "concierge", text: "Good evening. I'm Yara, your private concierge. Shall I curate a journey for you, or simply answer a question?", time: "now" },
];

const QUICK = ["Sunrise availability", "Private dinner", "Skill level", "Transfer from hotel"];

export const ConciergeChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = String(Date.now());
    setMsgs((m) => [...m, { id, from: "you", text, time: "now" }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [
        ...m,
        {
          id: id + "-r",
          from: "concierge",
          text: "A pleasure. Allow me a moment to consult our master rider. May I confirm your preferred date and party size?",
          time: "now",
        },
      ]);
    }, 1400);
  };

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.9 : 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeLuxury }}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Open concierge chat"
      >
        <span className="relative inline-flex items-center gap-3 pl-3 pr-5 py-3 bg-foreground text-background shadow-lift">
          <span className="relative inline-flex size-8 items-center justify-center bg-background/10">
            <MessageSquare className="size-3.5" />
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-background animate-pulse" />
          </span>
          <span className="text-[11px] tracking-[0.2em] uppercase">Concierge</span>
        </span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.55, ease: easeLuxury }}
            className="fixed bottom-6 right-6 z-50 w-[26rem] max-w-[calc(100vw-1.5rem)] h-[36rem] max-h-[calc(100vh-3rem)] bg-background border hairline shadow-lift flex flex-col origin-bottom-right"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b hairline">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center bg-foreground text-background font-display text-base">Y</span>
                <div>
                  <p className="font-display text-lg leading-none">Yara</p>
                  <p className="text-[10px] tracking-luxury uppercase text-ink-muted mt-1 inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-foreground" /> Concierge · online
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-ink-muted hover:text-foreground transition-colors" aria-label="Close">
                <X className="size-4" />
              </button>
            </header>

            <div ref={scroller} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {(msgs || []).map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: easeLuxury }}
                  className={cn("flex", m.from === "you" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[80%] px-4 py-3 text-sm leading-relaxed",
                    m.from === "you"
                      ? "bg-foreground text-background"
                      : "bg-surface-elevated border hairline text-foreground",
                  )}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-surface-elevated border hairline px-4 py-3 inline-flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-ink-muted"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {msgs.length <= 2 && (
              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {(QUICK || []).map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[10px] tracking-luxury uppercase border hairline px-3 py-1.5 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); send(draft); }}
              className="border-t hairline p-3 flex items-center gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write to Yara..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none placeholder:text-ink-muted/70"
              />
              <button
                type="submit"
                className="inline-flex size-10 items-center justify-center bg-foreground text-background hover:bg-accent transition-colors"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
