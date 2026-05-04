import { Link } from "@/components/shared/shims";
import { X, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Motion";

const PaymentCancel = () => (
  <div className="container pt-40 pb-32 min-h-[80vh]">
    <Reveal>
      <div className="max-w-2xl">
        <div className="inline-flex items-center justify-center size-16 border hairline rounded-full mb-8">
          <X className="size-7" />
        </div>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Payment not completed</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">
          The reservation was not written.
        </h1>
        <p className="mt-6 text-ink-soft max-w-xl text-pretty">
          No charge was made. Your seat on the plateau is still open — return when you are ready.
        </p>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/booking" className="inline-flex items-center gap-3 px-6 py-3.5 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase">
            Try again <ArrowUpRight className="size-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-3 px-6 py-3.5 border hairline text-[12px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
            Contact concierge
          </Link>
        </div>
      </div>
    </Reveal>
  </div>
);

export default PaymentCancel;
