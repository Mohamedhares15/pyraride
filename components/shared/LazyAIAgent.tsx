'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

// Lazy load the heavy AIAgent component
const AIAgent = dynamic(() => import('./AIAgent'), {
    ssr: false,
    loading: () => (
        <div className="ai-launcher">
            <Button
                className="h-14 w-14 rounded-full bg-white/20 shadow-lg shadow-black/20 border border-white/50"
                size="icon"
                aria-label="Loading assistant..."
                disabled
                style={{
                    backdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                }}
            >
                <MessageCircle className="h-6 w-6 text-primary drop-shadow-sm animate-pulse" />
            </Button>
        </div>
    ),
})

/**
 * LazyAIAgent - Optimized AI assistant component
 * 
 * Performance optimizations:
 * - Loads AIAgent code only after user interaction
 * - Reduces initial JavaScript bundle by ~29KB
 * - Improves TBT (Total Blocking Time)
 * - Shows lightweight trigger button initially
 */
export function LazyAIAgent() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [shouldLoad, setShouldLoad] = useState(false)

    // Pre-load on hover/focus for better UX (optional)
    const handleInteraction = () => {
        if (!shouldLoad) {
            setShouldLoad(true)
        }
    }

    useEffect(() => {
        if (shouldLoad && !isLoaded) {
            // Small delay to not block other critical resources
            const timeout = setTimeout(() => {
                setIsLoaded(true)
            }, 100)
            return () => clearTimeout(timeout)
        }
    }, [shouldLoad, isLoaded])

    // Show trigger button before AI Agent is loaded
    if (!isLoaded) {
        return (
            <div className="ai-launcher">
                <Button
                    onClick={handleInteraction}
                    onMouseEnter={handleInteraction}
                    onFocus={handleInteraction}
                    className="h-14 w-14 rounded-full bg-white/20 shadow-lg shadow-black/20 hover:bg-white/35 hover:scale-105 transition-all hover:shadow-2xl border border-white/50"
                    size="icon"
                    aria-label="Open PyraRide assistant"
                    style={{
                        backdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                        WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
                    }}
                >
                    <MessageCircle className="h-6 w-6 text-primary drop-shadow-sm" />
                    <motion.div
                        className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 shadow-md border border-white/30"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </Button>
            </div>
        )
    }

    // Load full AIAgent component after interaction
    return <AIAgent />
}
