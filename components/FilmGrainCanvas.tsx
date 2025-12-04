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
                opacity={0.06}
            />
            <Vignette
                offset={0.1}
                darkness={0.5}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}

export default function FilmGrainCanvas() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-50"
            style={{ mixBlendMode: "overlay" }}
            aria-hidden="true"
        >
            <Canvas
                gl={{
                    alpha: true,
                    stencil: false,
                    depth: false,
                    antialias: false,
                }}
                style={{ width: "100%", height: "100%" }}
                camera={{ position: [0, 0, 1] }}
            >
                <FilmGrainEffects />
            </Canvas>
        </div>
    );
}
