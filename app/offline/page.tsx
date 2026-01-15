"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto mb-8 w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl"
                >
                    <img
                        src="/icons/icon-192x192.png"
                        alt="PyraRide"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Offline Icon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-auto mb-6 w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center"
                >
                    <WifiOff className="w-8 h-8 text-zinc-400" />
                </motion.div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    You're Offline
                </h1>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    It looks like you've lost your internet connection.
                    Don't worry - your adventure at the pyramids awaits!
                    Please check your connection and try again.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="gap-2 w-full sm:w-auto">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>
                </div>

                {/* Decorative element */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-6xl"
                >
                    🐴🏛️
                </motion.div>
            </motion.div>
        </div>
    );
}
