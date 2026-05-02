import { Link } from "wouter";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 h-full w-full opacity-30" style={{ backgroundImage: "url(/hero-bg.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/30 flex items-center justify-center text-4xl">💰</div>
          </div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-semibold mb-4">Transparent Pricing</p>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">Pricing — Coming Soon</h1>
          <div className="w-12 h-px bg-[#D4AF37]/50 mx-auto mb-6" />
          <p className="text-gray-400 text-base font-light leading-relaxed mb-12">
            We're building a transparent pricing system that gives you complete clarity before you book. No surprises — just the perfect ride.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/stables" className="inline-block border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-white hover:text-black hover:border-white transition-colors duration-500 px-10 py-4 text-xs uppercase tracking-[0.2em]">
              Browse Stables
            </Link>
            <Link href="/" className="inline-block border border-white/20 text-white/70 hover:bg-white/10 transition-colors duration-500 px-10 py-4 text-xs uppercase tracking-[0.2em]">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
