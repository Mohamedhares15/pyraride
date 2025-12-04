"use client";

import { ReactNode, Component, ErrorInfo } from "react";
import dynamic from "next/dynamic";
import { ReactLenis } from "@studio-freight/react-lenis";

// Dynamically import canvas component with SSR disabled
const FilmGrainCanvas = dynamic(() => import("./FilmGrainCanvas"), {
    ssr: false,
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("CinematicWrapper Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

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
            {/* Film Grain Overlay Canvas - SSR disabled & Error Boundary protected */}
            <ErrorBoundary>
                <FilmGrainCanvas />
            </ErrorBoundary>

            {/* Main Content */}
            {children}
        </ReactLenis>
    );
}
