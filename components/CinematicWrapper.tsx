"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ReactLenis } from "@studio-freight/react-lenis";

// Dynamically import canvas component with SSR disabled
const FilmGrainCanvas = dynamic(() => import("./FilmGrainCanvas"), {
    ssr: false,
});

interface CinematicWrapperProps {
    children: ReactNode;
}

export default function CinematicWrapper({ children }: CinematicWrapperProps) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.1,
                duration: 1.5,
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2,
            }}
        >
            {/* Film Grain Overlay Canvas - SSR disabled */}
            <FilmGrainCanvas />

            {/* Main Content */}
            {children}
        </ReactLenis>
    );
}
