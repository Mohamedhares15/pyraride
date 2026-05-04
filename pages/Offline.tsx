import { Link } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { Reveal } from "@/components/shared/Motion";

const Offline = () => (
  <div className="container pt-40 pb-32 min-h-[80vh] flex items-center">
    <Reveal>
      <div className="max-w-xl">
        <WifiOff className="size-8 mb-6 text-ink-muted" />
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">No connection</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">
          The line to the plateau is quiet.
        </h1>
        <p className="mt-6 text-ink-soft text-pretty">
          You appear to be offline. Some pages may not be available until your connection returns.
        </p>
        <button onClick={() => window.location.reload()} className="mt-10 inline-flex items-center gap-3 px-6 py-3.5 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase">
          Try again
        </button>
        <div className="mt-6">
          <Link to="/" className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
            ← Return home
          </Link>
        </div>
      </div>
    </Reveal>
  </div>
);

export default Offline;
