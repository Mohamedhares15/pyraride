import { motion, useScroll, useTransform } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const NAV = [
  { to: "/stables", label: "Stables" },
  { to: "/packages", label: "Packages" },
  { to: "/training", label: "Training" },
  { to: "/cercle", label: "Cercle" },
  { to: "/gallery", label: "Gallery" },
];

export const Navbar = () => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.92]);
  const blur = useTransform(scrollY, [0, 80], [0, 14]);
  const filter = useTransform(blur, (v) => `blur(${v}px) saturate(1.1)`);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <motion.div
          aria-hidden
          style={{ opacity: bgOpacity, backdropFilter: filter, WebkitBackdropFilter: filter }}
          className="absolute inset-0 bg-background/80 border-b hairline"
        />
        <nav className="relative container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight text-foreground">PyraRides</span>
            <span className="hidden sm:inline text-[10px] tracking-luxury uppercase text-ink-muted">Est. Giza</span>
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) =>
                  `text-[13px] tracking-[0.16em] uppercase transition-colors ${
                    isActive ? "text-foreground" : "text-ink-muted hover:text-foreground"
                  }`
                }>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-5">
            <NotificationBell />
            <Link to="/signin" className="text-[13px] tracking-[0.16em] uppercase text-ink-muted hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/booking" className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase overflow-hidden">
              <span className="relative z-10">Reserve</span>
              <span aria-hidden className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]" />
            </Link>
          </div>

          <button onClick={() => setOpen(true)} className="md:hidden p-2 -mr-2" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{ open: { pointerEvents: "auto" }, closed: { pointerEvents: "none" } }}
        className="fixed inset-0 z-[60]"
      >
        <motion.div
          variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <motion.aside
          variants={{ open: { x: 0 }, closed: { x: "100%" } }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-background p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-12">
            <span className="font-display text-xl">PyraRides</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
          </div>
          <ul className="flex flex-col gap-6">
            {NAV.map((item, i) => (
              <motion.li
                key={item.to}
                initial={{ opacity: 0, x: 24 }}
                animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
                transition={{ delay: open ? 0.1 + i * 0.06 : 0, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Link to={item.to} className="font-display text-3xl">{item.label}</Link>
              </motion.li>
            ))}
          </ul>
          <div className="mt-auto pt-8 border-t hairline flex flex-col gap-4">
            <Link to="/signin" className="text-[13px] tracking-[0.16em] uppercase text-ink-muted">Sign in</Link>
            <Link to="/booking" className="inline-flex justify-center px-5 py-3 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase">Reserve</Link>
          </div>
        </motion.aside>
      </motion.div>
    </>
  );
};
