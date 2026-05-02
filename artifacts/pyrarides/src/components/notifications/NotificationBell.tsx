import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bell, Calendar, MessageCircle, Star, ArrowUpRight } from "lucide-react";
import { easeLuxury } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  icon: "calendar" | "message" | "star";
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const SAMPLE: Notif[] = [
  { id: "n1", icon: "calendar", title: "Reservation confirmed", body: "Sunrise Procession · 06:00, 02 May", time: "2m ago", unread: true },
  { id: "n2", icon: "message", title: "Message from Hassan", body: "Looking forward to riding with you, Madam.", time: "1h ago", unread: true },
  { id: "n3", icon: "star", title: "A letter awaits you", body: "Share your hour at the Plateau.", time: "Yesterday" },
  { id: "n4", icon: "calendar", title: "Concierge transfer scheduled", body: "07:15 from Mena House.", time: "2 days ago" },
];

const ICONS = { calendar: Calendar, message: MessageCircle, star: Star };

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(SAMPLE);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((i) => i.unread).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAll = () => setItems(items.map((i) => ({ ...i, unread: false })));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 -m-2 text-ink-muted hover:text-foreground transition-colors"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <motion.span
            layoutId="notif-dot"
            className="absolute top-1 right-1 size-1.5 rounded-full bg-foreground"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeLuxury }}
            className="absolute right-0 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] bg-background border hairline shadow-lift origin-top-right"
          >
            <div className="flex items-end justify-between px-5 py-4 border-b hairline">
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Telegrams</p>
                <p className="font-display text-xl leading-none mt-1">{unread > 0 ? `${unread} new` : "All read"}</p>
              </div>
              {unread > 0 && (
                <button onClick={markAll} className="text-[10px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-[26rem] overflow-y-auto">
              {items.map((n, i) => {
                const Icon = ICONS[n.icon];
                return (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: easeLuxury }}
                    className={cn(
                      "px-5 py-4 border-b hairline last:border-b-0 hover:bg-surface/50 transition-colors cursor-pointer relative",
                    )}
                  >
                    {n.unread && <span className="absolute left-2 top-1/2 -translate-y-1/2 size-1 rounded-full bg-foreground" />}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex size-8 items-center justify-center border hairline shrink-0">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] tracking-luxury uppercase text-ink-muted/70 mt-2">{n.time}</p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            <a href="/dashboard" className="flex items-center justify-between px-5 py-4 border-t hairline text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground hover:bg-surface/50 transition-colors">
              View all <ArrowUpRight className="size-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
