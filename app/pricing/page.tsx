import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Coming Soon | PyraRide",
  description: "Transparent pricing for horse riding experiences coming soon.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 h-full w-full opacity-30"
          style={{
            backgroundImage: "url(/hero-bg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          {/* Animated Logo/Icon */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl">🐴</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Text */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Coming Soon
          </h1>

          <p className="text-xl md:text-2xl text-white/70 max-w-xl mx-auto mb-8">
            We're working on transparent pricing for your perfect horse riding experience at the pyramids.
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          {/* Back to Home Link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-medium transition-all duration-300 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </div>
  );
}
