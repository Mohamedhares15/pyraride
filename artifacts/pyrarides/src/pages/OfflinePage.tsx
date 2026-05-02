import { motion } from "framer-motion";
import { Link } from "wouter";
import { WifiOff, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto mb-8 w-24 h-24 overflow-hidden border hairline"
        >
          <img
            src="/icons/icon-192x192.png"
            alt="PyraRides"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border hairline">
            <WifiOff className="h-7 w-7 text-foreground opacity-50" />
          </div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-3">Connection Lost</p>
          <h1 className="font-display text-4xl md:text-5xl mb-4">You're Offline</h1>
          <p className="text-ink-soft text-base leading-relaxed">
            No internet connection detected. Your PyraRides experience is temporarily unavailable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Button
            onClick={() => window.location.reload()}
            className="bg-foreground text-background hover:bg-foreground/90 uppercase tracking-[0.15em] text-xs"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors uppercase tracking-[0.15em] text-xs"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
