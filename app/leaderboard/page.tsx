"use client";

import { useState, useEffect } from "react";
import { Trophy, Search, TrendingUp, Award, Crown, ArrowLeft, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface Rider {
  id: string;
  fullName: string | null;
  email: string;
  rankPoints: number;
  rank: {
    name: string;
  } | null;
  rideResults: {
    pointsChange: number;
  }[];
}

interface League {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  riders: Rider[];
}

const leagueColors: Record<string, { bg: string; text: string; border: string }> = {
  wood: { bg: "bg-amber-900/20", text: "text-amber-600", border: "border-amber-600" },
  bronze: { bg: "bg-orange-900/20", text: "text-orange-600", border: "border-orange-600" },
  silver: { bg: "bg-gray-200/20", text: "text-gray-400", border: "border-gray-400" },
  gold: { bg: "bg-yellow-900/20", text: "text-yellow-500", border: "border-yellow-500" },
  platinum: { bg: "bg-purple-900/20", text: "text-purple-400", border: "border-purple-400" },
  elite: { bg: "bg-red-900/20", text: "text-red-500", border: "border-red-500" },
  champion: { bg: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600", text: "text-yellow-900", border: "border-yellow-500" },
};

const leagueIcons: Record<string, string> = {
  wood: "🪵",
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  elite: "👑",
  champion: "🏆",
};

export default function LeaderboardPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>("wood");
  const [league, setLeague] = useState<League | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeague();
  }, [selectedLeague]);

  // Hide footer on leaderboard page
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "footer { display: none !important; }";
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchLeague = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leagues?league=${selectedLeague}`);
      if (response.ok) {
        const data = await response.json();
        setLeague(data.league);
      }
    } catch (error) {
      console.error("Error fetching league:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = league?.riders.filter((rider) => {
    const name = rider.fullName || rider.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500 font-bold text-yellow-900">
          #{rank}
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-300 font-bold text-gray-700">
          #{rank}
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-400 font-bold text-orange-900">
          #{rank}
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-600 font-bold text-white">
        #{rank}
      </div>
    );
  };

  const leagueInfo = leagueColors[selectedLeague.toLowerCase()] || leagueColors.wood;
  const leagueIcon = leagueIcons[selectedLeague.toLowerCase()] || "🪵";

  return (
    <div className="bg-gradient-to-b from-black/80 via-black/90 to-black/95 min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-8 md:py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Leaderboard</h1>
                <p className="text-sm md:text-base text-white/70">
                  Compete and climb the ranks to become a champion rider
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white text-xs md:text-sm"
                >
                  <Home className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/stables">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white text-xs md:text-sm"
                >
                  Browse Stables
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-0 md:px-8">
        {/* League Selection & Search */}
        <Card className="mb-6 border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="text-2xl">{leagueIcon}</span>
              <span>Division</span>
            </CardTitle>
            <CardDescription className="text-white/70">Select a league to view rankings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood">🪵 Wood</SelectItem>
                    <SelectItem value="bronze">🥉 Bronze</SelectItem>
                    <SelectItem value="silver">🥈 Silver</SelectItem>
                    <SelectItem value="gold">🥇 Gold</SelectItem>
                    <SelectItem value="platinum">💎 Platinum</SelectItem>
                    <SelectItem value="elite">👑 Elite</SelectItem>
                    <SelectItem value="champion">🏆 Champion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current League Banner */}
        {league && (
          <Card className={`mb-6 ${leagueInfo.bg} ${leagueInfo.border} border-2 backdrop-blur-md`}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="text-4xl">{leagueIcon}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold capitalize text-white">{selectedLeague}</h2>
                <p className="text-sm text-white/70">
                  Ends {new Date(league.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {selectedLeague.toLowerCase() !== "champion" && (
                <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-xs text-white/70">Advance to</p>
                    <p className="font-semibold capitalize text-white">
                      {selectedLeague === "wood" ? "Bronze" :
                       selectedLeague === "bronze" ? "Silver" :
                       selectedLeague === "silver" ? "Gold" :
                       selectedLeague === "gold" ? "Platinum" :
                       selectedLeague === "platinum" ? "Elite" :
                       selectedLeague === "elite" ? "Champion" : ""}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md mb-0">
          <CardHeader>
            <CardTitle className="text-white">Rankings</CardTitle>
            <CardDescription className="text-white/70">
              Top riders in the {selectedLeague} division
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredRiders.length === 0 ? (
              <div className="py-12 text-center text-white/70">
                No riders found in this league
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 pb-2 text-xs md:text-sm font-semibold text-white/70">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-7">Player</div>
                  <div className="col-span-3 text-right">Trophies</div>
                </div>
                {filteredRiders.map((rider, index) => {
                  const rank = index + 1;
                  const riderName = rider.fullName || rider.email;
                  // Calculate total points earned from rides (only positive points)
                  const totalTrophies = rider.rideResults
                    ? rider.rideResults
                        .filter((result) => result.pointsChange > 0)
                        .reduce((sum, result) => sum + result.pointsChange, 0)
                    : 0;
                  return (
                    <div
                      key={rider.id}
                      className="grid grid-cols-12 items-center gap-2 md:gap-4 rounded-lg border border-white/10 bg-white/5 p-3 md:p-4 transition-colors hover:bg-white/10 backdrop-blur-sm"
                    >
                      <div className="col-span-2 flex justify-center md:justify-start">{getRankBadge(rank)}</div>
                      <div className="col-span-7 flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20">
                          <span className="text-xs md:text-sm font-semibold text-white">
                            {riderName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm md:text-base truncate">{riderName}</p>
                          <p className="text-xs text-white/60 truncate hidden md:block">{rider.email}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                          <span className="font-semibold text-white text-sm md:text-base">{totalTrophies}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

