import { Reveal } from "@/components/shared/Motion";
import { Link } from "@/components/shared/shims";

export const PageStub = ({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) => (
  <div className="container pt-40 pb-32 min-h-[80vh]">
    <Reveal>
      <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-5">{eyebrow}</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance max-w-4xl">{title}</h1>
    </Reveal>
    <Reveal delay={0.15}>
      <p className="mt-8 max-w-xl text-ink-soft text-pretty">{body}</p>
      <Link to="/" className="inline-block mt-12 text-[12px] tracking-[0.2em] uppercase border-b hairline pb-1 hover:border-foreground transition-colors">← Return home</Link>
    </Reveal>
  </div>
);

export default PageStub;
