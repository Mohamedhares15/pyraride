import { Link, useSearchParams } from "react-router-dom";
import { Check, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Motion";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? `PYR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return (
    <div className="container pt-40 pb-32 min-h-[80vh]">
      <Reveal>
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center size-16 border hairline rounded-full mb-8">
            <Check className="size-7" />
          </div>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Reservation confirmed</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">
            The plateau is held for you.
          </h1>
          <p className="mt-6 text-ink-soft max-w-xl text-pretty">
            A confirmation has been written into your ledger. We will write again the morning before your ride.
          </p>
          <p className="mt-8 text-[11px] tracking-luxury uppercase text-ink-muted">Reference</p>
          <p className="font-display text-3xl mt-1 tabular-nums">{ref}</p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-3 px-6 py-3.5 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase">
              View ledger <ArrowUpRight className="size-4" />
            </Link>
            <Link to="/" className="inline-flex items-center gap-3 px-6 py-3.5 border hairline text-[12px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
              Return home
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default PaymentSuccess;
