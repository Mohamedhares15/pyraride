import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Clock, MapPin, Trophy, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { useAuth } from "@/hooks/use-auth";
import { PACKAGES, HORSES, STABLES, ACADEMIES } from "@/lib/mock-data/seed";
import { cn } from "@/lib/utils";

type Tab = "rides" | "training";
type Booking = {
  id: string; packageId: string; date: Date; party: number; horseId: string;
  status: "confirmed" | "completed" | "pending"; reference: string;
};

const BOOKINGS: Booking[] = [
  { id: "j1", packageId: PACKAGES[0].id, date: new Date(Date.now() + 86400000 * 9), party: 2, horseId: HORSES[1].id, status: "confirmed", reference: "PYR-04821" },
  { id: "j2", packageId: PACKAGES[1].id, date: new Date(Date.now() + 86400000 * 32), party: 4, horseId: HORSES[4].id, status: "pending", reference: "PYR-04822" },
  { id: "j3", packageId: PACKAGES[2].id, date: new Date(Date.now() - 86400000 * 21), party: 2, horseId: HORSES[0].id, status: "completed", reference: "PYR-04601" },
];

const TRAININGS = [
  { id: "t1", academyId: ACADEMIES[0]?.id, programName: "Foundation Seat", sessionsCompleted: 3, totalSessions: 8, nextSession: new Date(Date.now() + 86400000 * 4) },
];

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const RiderDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("rides");
  const upcoming = BOOKINGS.filter((b) => b.status !== "completed").sort((a, b) => +a.date - +b.date);
  const past = BOOKINGS.filter((b) => b.status === "completed");
  const firstName = user?.fullName?.split(" ")[0] ?? "Rider";

  return (
    <div className="container pt-32 pb-32 min-h-screen">
      <Reveal>
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Your private ledger</p>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance">Welcome back, {firstName}.</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/chat" className="px-5 py-3 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Correspondence</Link>
            <Link to="/dashboard/loyalty" className="px-5 py-3 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Le Cercle</Link>
            <Link to="/booking" className="inline-flex items-center gap-3 px-6 py-3.5 bg-foreground text-background text-[12px] tracking-[0.18em] uppercase group">
              Reserve another <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </Reveal>

      <StaggerGroup className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
        {[
          { label: "Upcoming rides", value: upcoming.length },
          { label: "Completed", value: past.length },
          { label: "Rank points", value: user?.rankPoints ?? 0 },
          { label: "Standing", value: user?.currentLeague ?? "wood" },
        ].map((s) => (
          <StaggerItem key={s.label}>
            <div className="bg-background p-8">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.label}</p>
              <p className="mt-3 font-display text-5xl capitalize">{s.value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Tabs */}
      <div className="mt-20 flex border-b hairline">
        {(["rides", "training"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="relative px-6 py-4 text-[11px] tracking-[0.18em] uppercase">
            {tab === t && <motion.span layoutId="rider-tab" className="absolute inset-x-0 bottom-0 h-px bg-foreground" transition={{ duration: 0.4, ease: easeLuxury }} />}
            <span className={tab === t ? "text-foreground" : "text-ink-muted"}>{t === "rides" ? "Rides" : "Training"}</span>
          </button>
        ))}
      </div>

      {tab === "rides" && (
        <>
          <section className="mt-12">
            <h2 className="font-display text-3xl md:text-5xl mb-8">Upcoming</h2>
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarDays} title="The calendar is quiet." cta="Browse packages" to="/packages" />
            ) : (
              <StaggerGroup className="grid gap-6 md:grid-cols-2" gap={0.1}>
                {upcoming.map((b) => <BookingCard key={b.id} b={b} />)}
              </StaggerGroup>
            )}
          </section>

          <section className="mt-20">
            <h2 className="font-display text-3xl md:text-5xl mb-8">In the archive</h2>
            {past.length === 0 ? (
              <p className="text-sm text-ink-muted">No past rides yet.</p>
            ) : (
              <div className="space-y-0">
                {past.map((b, i) => {
                  const pkg = PACKAGES.find((p) => p.id === b.packageId)!;
                  const stable = STABLES.find((s) => s.id === pkg.stableId)!;
                  return (
                    <div key={b.id} className="grid md:grid-cols-12 gap-6 items-center py-6 border-t hairline last:border-b">
                      <div className="md:col-span-1 text-[11px] tracking-luxury uppercase text-ink-muted">№ {String(i + 1).padStart(2, "0")}</div>
                      <div className="md:col-span-5">
                        <h3 className="font-display text-2xl leading-tight">{pkg.title}</h3>
                        <p className="text-xs text-ink-muted mt-1">{stable.name}</p>
                      </div>
                      <div className="md:col-span-3 text-sm text-ink-soft">{fmt(b.date)}</div>
                      <div className="md:col-span-2 text-xs tracking-luxury uppercase text-ink-muted">{b.reference}</div>
                      <div className="md:col-span-1 flex md:justify-end">
                        <Link to={`/packages/${pkg.id}`} className="inline-flex size-9 items-center justify-center border hairline rounded-full hover:bg-foreground hover:text-background transition-all">
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {tab === "training" && (
        <section className="mt-12">
          <h2 className="font-display text-3xl md:text-5xl mb-8">Training programs</h2>
          {TRAININGS.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No training enrolment yet." cta="Browse academies" to="/training" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {TRAININGS.map((t) => {
                const academy = ACADEMIES.find((a) => a.id === t.academyId);
                const pct = (t.sessionsCompleted / t.totalSessions) * 100;
                return (
                  <article key={t.id} className="border hairline p-7 bg-surface-elevated/40">
                    <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{academy?.name ?? "Academy"}</p>
                    <h3 className="font-display text-3xl mt-1">{t.programName}</h3>
                    <div className="mt-6">
                      <div className="flex justify-between text-[11px] tracking-luxury uppercase mb-2">
                        <span className="text-ink-muted">Progress</span>
                        <span className="text-foreground tabular-nums">{t.sessionsCompleted}/{t.totalSessions}</span>
                      </div>
                      <div className="h-px bg-hairline relative overflow-hidden">
                        <span className="absolute inset-y-0 left-0 bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <p className="mt-6 text-sm text-ink-soft">Next session: <span className="text-foreground">{fmt(t.nextSession)}</span></p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const BookingCard = ({ b }: { b: Booking }) => {
  const pkg = PACKAGES.find((p) => p.id === b.packageId)!;
  const stable = STABLES.find((s) => s.id === pkg.stableId)!;
  const horse = HORSES.find((h) => h.id === b.horseId)!;
  return (
    <article className="border hairline bg-surface-elevated/40 group overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <motion.img src={pkg.imageUrl} alt={pkg.title} className="h-full w-full object-cover" whileHover={{ scale: 1.04 }} transition={{ duration: 1.2, ease: easeLuxury }} />
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-background/85 backdrop-blur text-[10px] tracking-luxury uppercase">
          <span className={cn("size-1.5 rounded-full", b.status === "confirmed" ? "bg-foreground" : "bg-ink-muted")} />
          {b.status}
        </div>
        <div className="absolute top-4 right-4 text-[10px] tracking-luxury uppercase text-background/90">{b.reference}</div>
      </div>
      <div className="p-7">
        <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{stable.name}</p>
        <h3 className="font-display text-3xl mt-1 leading-tight">{pkg.title}</h3>
        <dl className="mt-6 grid grid-cols-3 gap-4 text-sm border-t hairline pt-5">
          <Meta icon={CalendarDays} label="Date" value={fmt(b.date)} />
          <Meta icon={MapPin} label="Horse" value={horse.name} />
          <Meta icon={Clock} label="Party" value={`${b.party}`} />
        </dl>
        <div className="mt-7 flex items-center gap-3">
          <Link to={`/packages/${pkg.id}`} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">View itinerary</Link>
          <Link to="/chat" className="px-5 py-3 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Message</Link>
        </div>
      </div>
    </article>
  );
};

const Meta = ({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) => (
  <div>
    <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-1.5"><Icon className="size-3" /> {label}</p>
    <p className="mt-1.5 text-foreground truncate">{value}</p>
  </div>
);

const EmptyState = ({ icon: Icon, title, cta, to }: { icon: typeof Trophy; title: string; cta: string; to: string }) => (
  <div className="border hairline p-16 text-center bg-surface-elevated/30">
    <Icon className="size-8 mx-auto text-ink-muted" />
    <p className="mt-4 font-display text-2xl">{title}</p>
    <Link to={to} className="inline-flex items-center gap-2 mt-6 px-5 py-3 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
      {cta} <ArrowUpRight className="size-4" />
    </Link>
  </div>
);

export default RiderDashboard;
