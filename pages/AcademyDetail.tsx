import { Link, useParams } from "@/components/shared/shims";
import { GraduationCap, Clock, Users, ArrowUpRight } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/Motion";
import { ACADEMIES } from "@/lib/mock-data/seed";
import { fmtMoney } from "@/lib/format";

const AcademyDetail = () => {
  const { academyId } = useParams<{ academyId: string }>();
  const academy = ACADEMIES.find((a) => a.id === academyId || a.slug === academyId);

  if (!academy) {
    return (
      <div className="container pt-40 pb-32 min-h-[80vh]">
        <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">Not found</p>
        <h1 className="font-display text-5xl">Academy not on record.</h1>
        <Link to="/training" className="inline-block mt-8 text-[12px] tracking-luxury uppercase border-b hairline pb-1">← Back to training</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[460px] overflow-hidden border-b hairline">
        <img src={academy.imageUrl} alt={academy.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 container pb-12 text-background">
          <p className="text-[11px] tracking-luxury uppercase opacity-80 mb-3">{academy.location}</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">{academy.name}</h1>
        </div>
      </section>

      <section className="container py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <Reveal>
            <p className="text-ink-soft text-pretty leading-relaxed">{academy.description}</p>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl mb-6 border-b hairline pb-4">Programs</h2>
            <StaggerGroup className="space-y-4" gap={0.08}>
              {(academy.programs || []).map((p) => (
                <StaggerItem key={p.id}>
                  <article className="border hairline p-7 bg-surface-elevated/30">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{p.skillLevel}</p>
                        <h3 className="mt-1 font-display text-2xl">{p.name}</h3>
                        <p className="mt-2 text-sm text-ink-soft max-w-2xl">{p.description}</p>
                      </div>
                      <p className="font-display text-3xl tabular-nums">{fmtMoney(p.price)}</p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-5 text-[11px] tracking-luxury uppercase text-ink-muted">
                      <span className="inline-flex items-center gap-1.5"><Users className="size-3" /> {p.totalSessions} sessions</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="size-3" /> {p.sessionDuration} min each</span>
                    </div>
                    <Link to={`/training/${academy.id}/checkout?programId=${p.id}`} className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
                      Enrol <ArrowUpRight className="size-4" />
                    </Link>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Reveal>
        </div>

        <aside className="space-y-6">
          <div className="border hairline p-6">
            <p className="text-[10px] tracking-luxury uppercase text-ink-muted inline-flex items-center gap-1.5"><GraduationCap className="size-3" /> Captain</p>
            <div className="mt-4 flex items-center gap-3">
              {academy.captainAvatar && <img src={academy.captainAvatar} alt="" className="size-12 rounded-full object-cover" />}
              <div>
                <p className="font-display text-xl">{academy.captainName}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-soft">{academy.captainBio}</p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AcademyDetail;

// Forced SSR to bypass static pre-render errors during UI migration
export const getServerSideProps = async () => ({ props: {} });
