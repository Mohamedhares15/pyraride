"use client";
/**
 * Next.js App Router variant of SiteLayout.
 * Replace the original `SiteLayout.tsx` with this when migrating to pyraride,
 * or import from this file directly. Uses `next/navigation` + `children`.
 */
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ConciergeChat } from "@/components/concierge/ConciergeChat";

export const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() || "/";
  const hideChat =
    pathname.startsWith("/auth") ||
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/offline";
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground grain">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      {!hideChat && <ConciergeChat />}
    </div>
  );
};
