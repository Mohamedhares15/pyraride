import { motion } from "framer-motion";
import { Link } from "wouter";
import { WifiOff, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black safe-area-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto mb-8 w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl"
        >
          <img src="/icons/icon-192x192.png" alt="PyraRides" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
          <WifiOff className="h-16 w-16 text-[#D4AF37] mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-bold text-white mb-3">You're Offline</h1>
          <p className="text-white/60 text-base leading-relaxed">
            No internet connection detected. Your PyraRides experience is temporarily unavailable.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-3">
          <Button onClick={() => window.location.reload()} className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
