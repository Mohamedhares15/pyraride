"use client";

export default function FilmGrainCanvas() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-50"
            style={{
                mixBlendMode: "overlay",
                pointerEvents: "none",
                opacity: 0.4,
            }}
            aria-hidden="true"
        >
            <svg className="h-full w-full opacity-[0.4]">
                <filter id="noise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
            {/* Vignette Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle, transparent 50%, black 150%)",
                    mixBlendMode: "multiply",
                    opacity: 0.5,
                }}
            />
        </div>
    );
}
