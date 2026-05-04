"use client";
import { useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "@/components/shared/shims";
import { Reveal } from "@/components/shared/Motion";
import { toast } from "sonner";
import { ACADEMIES } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";
import { ArrowUpRight } from "lucide-react";

const TrainingCheckout = () => {
  const { academyId } = useParams<{ academyId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const academy = ACADEMIES.find((a) => a.id === academyId || a.slug === academyId);
  const programId = params.get("programId");
  const program = academy?.programs.find((p) => p.id === programId) ?? academy?.programs[0];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);

  if (!academy || !program) {
    return (
      <div className="container pt-40 pb-32 min-h-[60vh]">
        <p>Program not found.</p>
        <Link to="/training" className="underline">Back to training</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    toast.success("Enrolment confirmed. Welcome to the program.");
    navigate(`/payment/success?ref=ENR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
  };

  const inp = "w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors";

  return (
    <div className="container pt-32 pb-32 min-h-screen grid lg:grid-cols-5 gap-16">
      <section className="lg:col-span-3">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Enrolment · {academy.name}</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.02] text-balance">Begin {program.name}.</h1>
        </Reveal>

        <form onSubmit={submit} className="mt-12 space-y-7 max-w-lg">
          <label className="block">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-2 ${inp}`} required />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${inp}`} required />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`mt-2 ${inp}`} required />
          </label>

          <button type="submit" disabled={pending} className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase disabled:opacity-70">
            {pending ? "One moment…" : <>Confirm enrolment <ArrowUpRight className="size-4" /></>}
          </button>
        </form>
      </section>

      <aside className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start">
        <div className="border hairline p-7 bg-surface-elevated/40">
          <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Program</p>
          <h2 className="mt-2 font-display text-3xl">{program.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">{academy.name} · {academy.location}</p>

          <dl className="mt-6 space-y-3 text-sm border-t hairline pt-5">
            <div className="flex justify-between"><dt className="text-ink-muted">Skill level</dt><dd className="capitalize">{program.skillLevel.toLowerCase()}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Sessions</dt><dd className="tabular-nums">{program.totalSessions}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Each</dt><dd className="tabular-nums">{program.sessionDuration} min</dd></div>
          </dl>

          <div className="mt-6 border-t hairline pt-5 flex justify-between items-baseline">
            <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Total</span>
            <span className="font-display text-4xl tabular-nums">{fmtMoney(program.price)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TrainingCheckout;

// Forced SSR to bypass static pre-render errors during UI migration
export const getServerSideProps = async () => ({ props: {} });
