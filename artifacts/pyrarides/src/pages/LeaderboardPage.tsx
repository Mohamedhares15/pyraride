import { useState, useEffect } from "react";
import { Trophy, Search, Medal, Crown, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/Motion";
import heroImg from "@/assets/hero-pyramids.jpg";

interface Rider {
  id: string;
  fullName: string | null;
  email: string;
  profilePhoto?: string | null;
  profileImageUrl?: string | null;
  rankPoints: number;
  rank: { name: string } | null;
}

export default function LeaderboardPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setRiders(data.riders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredRiders = riders.filter((rider) => {
    const name = rider.fullName || rider.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getTierLabel = (points: number) => {
    if (points >= 1701) return { name: "Advanced", cls: "border-foreground/30 text-foreground" };
    if (points >= 1301) return { name: "Intermediate", cls: "border-foreground/20 text-ink-soft" };
    return { name: "Beginner", cls: "border-foreground/10 text-ink-muted" };
  };

  const getRankIcon = (rank: number) => {
    const base = "flex h-11 w-11 items-center justify-center border";
    if (rank === 1) return <div className={`${base} border-foreground bg-foreground text-background`}><Crown className="h-5 w-5" /></div>;
    if (rank === 2) return <div className={`${base} border-foreground/40 bg-surface text-foreground`}><Medal className="h-5 w-5" /></div>;
    if (rank === 3) return <div className={`${base} border-foreground/25 bg-surface text-foreground/70`}><Medal className="h-5 w-5" /></div>;
    return <div className="flex h-11 w-11 items-center justify-center border hairline bg-surface"><span className="text-sm font-light text-ink-muted">#{rank}</span></div>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img src={heroImg} alt="Pyramids" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        <div className="relative h-full container flex flex-col justify-end pb-16">
          <div className="flex gap-3 mb-8">
            <Link href="/" className="inline-block border border-background/30 text-background text-[11px] tracking-luxury uppercase px-5 py-2.5 hover:bg-background hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/stables" className="inline-block border border-background/20 text-background/70 text-[11px] tracking-luxury uppercase px-5 py-2.5 hover:bg-background/10 transition-colors">
              Browse Stables
            </Link>
          </div>
          <p className="text-[11px] tracking-luxury uppercase text-background/70 mb-3">PyraRides · Rankings</p>
          <h1 className="font-display text-5xl md:text-7xl text-background leading-[0.95]">
            Global<br />Leaderboard
          </h1>
          <p className="mt-4 text-background/60 text-sm max-w-md">
            Compete with riders across Egypt. Earn points, climb the ranks, and become a champion.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="container py-10">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <Input
            placeholder="Search riders by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 border-foreground/20 bg-surface pl-12 text-foreground placeholder:text-ink-muted focus:border-foreground/40"
          />
        </div>
      </section>

      {/* Table */}
      <section className="container pb-24">
        <div className="border-t hairline mb-4 flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-foreground opacity-50" />
            <p className="text-[11px] tracking-luxury uppercase text-ink-muted">All Rankings</p>
          </div>
          <p className="text-sm text-ink-muted">{filteredRiders.length} riders competing</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="border hairline py-20 text-center">
            <Trophy className="h-10 w-10 mx-auto mb-4 text-foreground opacity-20" />
            <p className="text-ink-muted">No riders found</p>
          </div>
        ) : (
          <StaggerGroup className="divide-y divide-foreground/8">
            {filteredRiders.map((rider, index) => {
              const rank = index + 1;
              const riderName = rider.fullName || rider.email;
              const profileImage = rider.profilePhoto || rider.profileImageUrl;
              const tier = getTierLabel(rider.rankPoints);
              return (
                <StaggerItem key={rider.id}>
                  <div className={`flex items-center gap-5 py-5 transition-colors hover:bg-surface ${rank <= 3 ? "bg-surface/60" : ""}`}>
                    <div className="w-14 flex-shrink-0 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden border hairline bg-surface-elevated">
                      {profileImage ? (
                        <img src={profileImage} alt={riderName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-lg text-foreground">
                          {riderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{riderName}</p>
                      <span className={`inline-block border text-[10px] tracking-luxury uppercase px-2 py-0.5 mt-1 ${tier.cls}`}>
                        {tier.name}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-foreground opacity-40" />
                        <span className="font-display text-2xl font-light">{rider.rankPoints}</span>
                      </div>
                      <p className="text-[10px] tracking-luxury uppercase text-ink-muted">points</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </section>
    </div>
  );
}
