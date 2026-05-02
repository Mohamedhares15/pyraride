'use client'

import { useEffect, useState, ReactNode } from 'react'
import dynamic from '@/shims/next-dynamic'

const CinematicWrapper = dynamic(() => import('./CinematicWrapper'), {
    ssr: false,
    loading: () => null,
})

interface OptimalCinematicWrapperProps {
    children: ReactNode
}

export function OptimalCinematicWrapper({ children }: OptimalCinematicWrapperProps) {
    const [showEffects, setShowEffects] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const shouldLoadEffects = () => {
            const isDesktop = window.innerWidth > 1024
            const connection = (navigator as any).connection
            const hasGoodConnection =
                !connection ||
                connection.effectiveType === '4g' ||
                connection.effectiveType === '5g' ||
                connection.downlink > 5
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            return isDesktop && hasGoodConnection && !prefersReducedMotion
        }

        const timeout = setTimeout(() => {
            setShowEffects(shouldLoadEffects())
            setIsChecking(false)
        }, 300)

        return () => clearTimeout(timeout)
    }, [])

    if (isChecking || !showEffects) {
        return <>{children}</>
    }

    return <CinematicWrapper>{children}</CinematicWrapper>
}
