import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Reveal } from "@/components/shared/Motion";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/format";
import { ArrowUpRight, Check } from "lucide-react";

const PROGRAMMES = [
  {
    id: "novice",
    eyebrow: "Programme I",
    name: "First Saddle",
    audience: "For those who have never ridden",
    duration: "3 mornings",
    price: 1240,
    inclusions: ["Private master rider", "Ground school & seat work", "Two desert rides", "Linen breakfast each morning"],
  },
  {
    id: "intermediate",
    eyebrow: "Programme II",
    name: "The Continental Seat",
    audience: "For confident riders",
    duration: "5 mornings",
    price: 2680,
    inclusions: ["Dressage in private arena", "Sunrise plateau rides", "Trot, canter, lateral work", "Daily concierge transfer"],
  },
  {
    id: "advanced",
    eyebrow: "Programme III",
    name: "The Horus Initiation",
    audience: "For accomplished horsemen",
    duration: "7 mornings",
    price: 4980,
    inclusions: ["Olympic-grade dressage hall", "Egyptian Arabian assigned to you", "Desert long-rides", "Private banquet on closing"],
  },
];

const TrainingDirectCheckout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const programmeId = params.get("programme") ?? params.get("programmeId");
  const initial = useMemo(
    () => PROGRAMMES.find((p) => p.id === programmeId) ?? PROGRAMMES[1],
    [programmeId],
  );

  const [selected, setSelected] = useState(initial.id);
  const programme = PROGRAMMES.find((p) => p.id === selected) ?? initial;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    toast.success("Enrolment confirmed. Welcome to the programme.");
    navigate(`/payment/success?ref=ENR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
  };

  const inp =
    "w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors";

  return (
    <div className="container pt-32 pb-32 min-h-screen grid lg:grid-cols-5 gap-16">
      <section className="lg:col-span-3">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Direct enrolment · Training</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.02] text-balance">
            Reserve your programme.
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink-soft">
            Select a programme and confirm in a single page. We handle scheduling and transport once you arrive.
          </p>
        </Reveal>

        {/* programme picker */}
        <div className="mt-10 grid sm:grid-cols-3 gap-3">
          {PROGRAMMES.map((p) => {
            const active = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`text-left border hairline p-4 transition-colors ${
                  active ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-surface-elevated/50"
                }`}
              >
                <p className={`text-[10px] tracking-luxury uppercase ${active ? "text-background/60" : "text-ink-muted"}`}>
                  {p.eyebrow}
                </p>
                <p className="mt-2 font-display text-xl leading-tight">{p.name}</p>
                <p className={`mt-2 text-[11px] tabular-nums ${active ? "text-background/70" : "text-ink-muted"}`}>
                  {fmtMoney(p.price)} · {p.duration}
                </p>
              </button>
            );
          })}
        </div>

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
          <label className="block">
            <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Preferred start date</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={`mt-2 ${inp}`} required />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase disabled:opacity-70"
          >
            {pending ? "One moment…" : <>Confirm enrolment <ArrowUpRight className="size-4" /></>}
          </button>

          <p className="text-[11px] text-ink-muted">
            Prefer guidance first? <Link to="/training" className="underline">Read the full programme</Link>.
          </p>
        </form>
      </section>

      <aside className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start">
        <div className="border hairline p-7 bg-surface-elevated/40">
          <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{programme.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl">{programme.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">{programme.audience}</p>

          <ul className="mt-6 space-y-3 text-sm border-t hairline pt-5">
            {programme.inclusions.map((inc) => (
              <li key={inc} className="flex items-start gap-3">
                <Check className="size-4 mt-0.5 shrink-0" />
                <span className="text-ink-soft">{inc}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 text-sm border-t hairline pt-5">
            <div className="flex justify-between"><dt className="text-ink-muted">Duration</dt><dd className="tabular-nums">{programme.duration}</dd></div>
          </dl>

          <div className="mt-6 border-t hairline pt-5 flex justify-between items-baseline">
            <span className="text-[11px] tracking-luxury uppercase text-ink-muted">Total</span>
            <span className="font-display text-4xl tabular-nums">{fmtMoney(programme.price)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TrainingDirectCheckout;
