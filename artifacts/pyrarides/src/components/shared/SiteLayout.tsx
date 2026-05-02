import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ConciergeChat } from "@/components/concierge/ConciergeChat";

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  const [pathname] = useLocation();
  const hideChat = pathname.startsWith("/auth")
    || pathname === "/signin"
    || pathname === "/signup"
    || pathname === "/forgot-password"
    || pathname === "/reset-password"
    || pathname === "/offline";
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground grain">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:text-xs focus:tracking-luxury focus:uppercase"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
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

export default SiteLayout;
