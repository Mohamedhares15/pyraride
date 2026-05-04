import { useNavigate } from "@/components/shared/shims";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/Motion";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const ROLES: { role: UserRole; label: string; copy: string; to: string }[] = [
  { role: "rider", label: "Rider", copy: "Your reservations, the horses you have known, your standing in Le Cercle.", to: "/dashboard" },
  { role: "stable_owner", label: "Stable owner", copy: "Stable OS — horses, schedule, bookings, payouts, reviews.", to: "/admin" },
  { role: "captain", label: "Captain", copy: "Today's rides, the riders in your charge, and the route plan.", to: "/dashboard/captain" },
  { role: "driver", label: "Driver", copy: "Pickups, drop-offs, and transport assignments for the day.", to: "/dashboard/driver" },
  { role: "cx_media", label: "CX & Media", copy: "Guest correspondence, photo curation, and gallery moderation.", to: "/dashboard/cx-media" },
  { role: "admin", label: "House admin", copy: "Global operations — every estate, every reservation, every figure.", to: "/dashboard/admin" },
];

const DevSwitch = () => {
  const { signInAs, user } = useAuth();
  const navigate = useNavigate();

  const enter = async (role: UserRole, to: string) => {
    await signInAs(role);
    toast.success(`Now signed in as ${role.replace("_", " ")}.`);
    navigate(to);
  };

  return (
    <div className="min-h-screen pt-28">
      <section className="container py-16 md:py-24 border-b hairline">
        <Reveal>
          <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">House switchboard</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] max-w-3xl text-balance">
            Step into any seat at the table.
          </h1>
          <p className="mt-6 max-w-xl text-base text-ink-soft text-pretty">
            A development convenience. Choose a role and the dashboard, the data, and the navigation will follow. Currently signed in as{" "}
            <span className="text-foreground">{user ? `${user.fullName} · ${user.role.replace("_", " ")}` : "no one"}</span>.
          </p>
        </Reveal>
      </section>

      <section className="container py-20 md:py-28">
        <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border hairline">
          {(ROLES || []).map((r) => (
            <StaggerItem key={r.role}>
              <button
                onClick={() => enter(r.role, r.to)}
                className="group bg-background p-10 text-left w-full h-full hover:bg-surface transition-colors"
              >
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Seat</p>
                <h3 className="mt-3 font-display text-3xl">{r.label}</h3>
                <p className="mt-4 text-sm text-ink-soft text-pretty">{r.copy}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-foreground/70 group-hover:text-foreground transition-colors">
                  Enter <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
};

export default DevSwitch;
