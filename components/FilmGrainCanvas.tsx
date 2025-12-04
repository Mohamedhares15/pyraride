"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

function FilmGrainEffects() {
    return (
        <EffectComposer>
            <Noise
                premultiply
                blendFunction={BlendFunction.OVERLAY}
                opacity={0.2} // High intensity for visibility
            />
            <Vignette
                offset={0.1}
                darkness={0.7} // Darker vignette
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}

export default function FilmGrainCanvas() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-50"
            style={{
                mixBlendMode: "normal", // Ensure visibility on dark backgrounds
                pointerEvents: "none"   // CRITICAL: Allow clicks to pass through
            }}
            aria-hidden="true"
        >
            <Canvas
                className="pointer-events-none"
                gl={{
                    alpha: true,
                    stencil: false,
                    depth: false,
                    antialias: false,
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none" // CRITICAL: Ensure Canvas doesn't block clicks
                }}
                camera={{ position: [0, 0, 1] }}
            >
                <FilmGrainEffects />
            </Canvas>
        </div>
    );
}
