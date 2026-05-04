import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, GraduationCap, CalendarDays, Award } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";

// ─────────────────────────────────────────────────────────────────────────────
// Captain dashboard — Training Academy management
// /lib spec: Academy / TrainingProgram models
// ─────────────────────────────────────────────────────────────────────────────

const COHORTS = [
  { id: "c1", name: "Sunrise Beginners · April", students: 12, sessions: 8, completion: 0.62, level: "Novice" },
  { id: "c2", name: "Dressage Foundations",       students: 6,  sessions: 12, completion: 0.41, level: "Intermediate" },
  { id: "c3", name: "Master Programme",            students: 3,  sessions: 24, completion: 0.18, level: "Master" },
];

const STUDENTS = [
  { id: "s1", name: "Yusuf Hadid",        cohort: "Sunrise Beginners",     attendance: 0.95, rank: 1080, lastSession: "2d ago" },
  { id: "s2", name: "Amélie Roux",        cohort: "Dressage Foundations",  attendance: 0.88, rank: 1410, lastSession: "5d ago" },
  { id: "s3", name: "Tariq Al-Sabah",     cohort: "Master Programme",      attendance: 0.99, rank: 2510, lastSession: "yesterday" },
  { id: "s4", name: "Mei Lin",            cohort: "Sunrise Beginners",     attendance: 0.74, rank: 940,  lastSession: "1w ago" },
  { id: "s5", name: "Henrietta Castell",  cohort: "Dressage Foundations",  attendance: 0.91, rank: 1620, lastSession: "3d ago" },
];

const SESSIONS = [
  { id: "ss1", date: "Tue · 06:00", program: "Sunrise Beginners", attendees: 8, focus: "Posture & seat" },
  { id: "ss2", date: "Wed · 17:00", program: "Dressage Foundations", attendees: 5, focus: "Half-pass" },
  { id: "ss3", date: "Fri · 06:00", program: "Master Programme",  attendees: 3, focus: "Passage" },
];

const CaptainDashboard = () => (
  <div className="min-h-screen pt-28">
    <div className="container border-b hairline pb-6">
      <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Academy · Captain</p>
      <h1 className="font-display text-4xl md:text-5xl leading-none">The training house.</h1>
    </div>

    <div className="container py-12 pb-32 space-y-16">
      {/* KPIs */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border hairline" gap={0.06}>
        {[
          { label: "Active cohorts", value: COHORTS.length, icon: GraduationCap },
          { label: "Students", value: STUDENTS.length, icon: Users },
          { label: "Sessions · this week", value: SESSIONS.length, icon: CalendarDays },
          { label: "Avg. attendance", value: "89%", icon: Award },
        ].map((s) => (
          <StaggerItem key={s.label}>
            <div className="bg-background p-8">
              <s.icon className="size-4 text-ink-muted mb-4" />
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.label}</p>
              <p className="mt-3 font-display text-4xl">{s.value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Cohorts */}
      <Reveal>
        <div className="flex items-end justify-between mb-6 border-b hairline pb-5">
          <h2 className="font-display text-3xl md:text-4xl">Programmes</h2>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
            New cohort <ArrowUpRight className="size-3.5" />
          </button>
        </div>
        <div className="border hairline">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b hairline bg-surface/40 text-[10px] tracking-luxury uppercase text-ink-muted">
            <div className="col-span-5">Cohort</div>
            <div className="col-span-2">Level</div>
            <div className="col-span-1 text-right">Students</div>
            <div className="col-span-1 text-right">Sessions</div>
            <div className="col-span-3">Completion</div>
          </div>
          {COHORTS.map((c) => (
            <div key={c.id} className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 border-b hairline last:border-b-0 hover:bg-surface/50 transition-colors items-center">
              <div className="md:col-span-5 font-display text-2xl">{c.name}</div>
              <div className="md:col-span-2 text-[11px] tracking-luxury uppercase text-ink-muted">{c.level}</div>
              <div className="md:col-span-1 md:text-right tabular-nums">{c.students}</div>
              <div className="md:col-span-1 md:text-right tabular-nums">{c.sessions}</div>
              <div className="md:col-span-3">
                <div className="relative h-px bg-hairline">
                  <motion.span
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: c.completion }} viewport={{ once: true }}
                    transition={{ duration: 1, ease: easeLuxury }} style={{ originX: 0 }}
                    className="absolute inset-0 bg-foreground"
                  />
                </div>
                <p className="mt-2 text-xs text-ink-muted tabular-nums">{Math.round(c.completion * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Students */}
        <Reveal>
          <h2 className="font-display text-3xl mb-6 border-b hairline pb-4">Students</h2>
          <ul className="space-y-0">
            {STUDENTS.map((s) => (
              <li key={s.id} className="grid grid-cols-12 gap-3 items-center py-4 border-b hairline">
                <div className="col-span-5">
                  <p className="text-foreground">{s.name}</p>
                  <p className="text-xs text-ink-muted">{s.cohort}</p>
                </div>
                <div className="col-span-3 text-xs text-ink-soft">Last · {s.lastSession}</div>
                <div className="col-span-2 text-sm tabular-nums">{Math.round(s.attendance * 100)}%</div>
                <div className="col-span-2 text-right font-display text-lg tabular-nums">{s.rank}</div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Sessions this week */}
        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl mb-6 border-b hairline pb-4">This week</h2>
          <ul className="space-y-0">
            {SESSIONS.map((s) => (
              <li key={s.id} className="py-5 border-b hairline">
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{s.date}</p>
                <p className="font-display text-2xl mt-1">{s.program}</p>
                <p className="text-xs text-ink-muted mt-1">{s.attendees} students · {s.focus}</p>
              </li>
            ))}
          </ul>
          <Link to="/admin/schedule" className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
            Open the calendar <ArrowUpRight className="size-3" />
          </Link>
        </Reveal>
      </div>
    </div>
  </div>
);

export default CaptainDashboard;
