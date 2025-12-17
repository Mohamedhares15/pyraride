"use client";

import { useState, useEffect } from "react";
import { Trophy, Search, Medal, Crown, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Rider {
  id: string;
  fullName: string | null;
  email: string;
  profilePhoto?: string | null;
  profileImageUrl?: string | null;
  rankPoints: number;
  rank: {
    name: string;
  } | null;
  _count?: {
    bookings: number;
    reviews: number;
  };
}

export default function LeaderboardPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  // Hide footer on leaderboard page
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "footer { display: none !important; }";
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchGlobalLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setRiders(data.riders || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter((rider) => {
    const name = rider.fullName || rider.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 animate-pulse" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-500/50">
            <Crown className="h-6 w-6 text-yellow-900" />
          </div>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-lg">
          <Medal className="h-6 w-6 text-gray-700" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg">
          <Medal className="h-6 w-6 text-orange-900" />
        </div>
      );
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20">
        <span className="text-lg font-bold text-white">#{rank}</span>
      </div>
    );
  };

  const getTierBadge = (points: number) => {
    if (points >= 1701) return { name: "Advanced", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    if (points >= 1301) return { name: "Intermediate", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    return { name: "Beginner", color: "bg-green-500/20 text-green-400 border-green-500/30" };
  };

  return (
    <div className="bg-gradient-to-b from-black via-black/95 to-black min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-primary/20 via-black to-black py-12 md:py-16">
        <div className="absolute inset-0 bg-[url('/hero-bg.webp')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30">
              <Trophy className="h-10 w-10 text-yellow-900" />
            </div>
            <h1 className="mb-2 text-4xl md:text-5xl font-bold text-white">
              Global <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Leaderboard</span>
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              Compete with riders across Egypt. Earn points, climb the ranks, and become a champion!
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        {/* Search Bar */}
        <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search riders by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-white/5 border-white/10 pl-12 text-white placeholder:text-white/40 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        {!loading && filteredRiders.length >= 3 && !searchQuery && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="relative mb-3">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-gray-400 bg-white/10">
                  {filteredRiders[1]?.profilePhoto || filteredRiders[1]?.profileImageUrl ? (
                    <img
                      src={filteredRiders[1]?.profilePhoto || filteredRiders[1]?.profileImageUrl || ""}
                      alt="2nd"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                      {(filteredRiders[1]?.fullName || filteredRiders[1]?.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-gray-900">
                  2
                </div>
              </div>
              <p className="text-sm font-medium text-white truncate max-w-full">
                {filteredRiders[1]?.fullName || filteredRiders[1]?.email?.split("@")[0]}
              </p>
              <p className="text-lg font-bold text-gray-400">{filteredRiders[1]?.rankPoints} pts</p>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 animate-pulse opacity-60" />
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-500 bg-white/10">
                  {filteredRiders[0]?.profilePhoto || filteredRiders[0]?.profileImageUrl ? (
                    <img
                      src={filteredRiders[0]?.profilePhoto || filteredRiders[0]?.profileImageUrl || ""}
                      alt="1st"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                      {(filteredRiders[0]?.fullName || filteredRiders[0]?.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg">
                  <Crown className="h-4 w-4 text-yellow-900" />
                </div>
              </div>
              <p className="text-base font-medium text-white truncate max-w-full">
                {filteredRiders[0]?.fullName || filteredRiders[0]?.email?.split("@")[0]}
              </p>
              <p className="text-xl font-bold text-yellow-500">{filteredRiders[0]?.rankPoints} pts</p>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="relative mb-3">
                <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-orange-400 bg-white/10">
                  {filteredRiders[2]?.profilePhoto || filteredRiders[2]?.profileImageUrl ? (
                    <img
                      src={filteredRiders[2]?.profilePhoto || filteredRiders[2]?.profileImageUrl || ""}
                      alt="3rd"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                      {(filteredRiders[2]?.fullName || filteredRiders[2]?.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-orange-900">
                  3
                </div>
              </div>
              <p className="text-sm font-medium text-white truncate max-w-full">
                {filteredRiders[2]?.fullName || filteredRiders[2]?.email?.split("@")[0]}
              </p>
              <p className="text-lg font-bold text-orange-400">{filteredRiders[2]?.rankPoints} pts</p>
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-yellow-500" />
              All Rankings
            </CardTitle>
            <CardDescription className="text-white/60">
              {filteredRiders.length} riders competing
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredRiders.length === 0 ? (
              <div className="py-16 text-center text-white/60">
                No riders found
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredRiders.map((rider, index) => {
                  const rank = index + 1;
                  const riderName = rider.fullName || rider.email;
                  const profileImage = rider.profilePhoto || rider.profileImageUrl;
                  const tier = getTierBadge(rider.rankPoints);

                  return (
                    <Link
                      key={rider.id}
                      href={`/users/${rider.id}`}
                      className="block"
                    >
                      <div className={`flex items-center gap-4 p-4 transition-all hover:bg-white/5 ${rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}`}>
                        {/* Rank */}
                        <div className="w-14 flex-shrink-0">
                          {getRankDisplay(rank)}
                        </div>

                        {/* Avatar */}
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={riderName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                              {riderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Name & Tier */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{riderName}</p>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tier.color}`}>
                            {tier.name}
                          </span>
                        </div>

                        {/* Points */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="text-xl font-bold text-white">{rider.rankPoints}</span>
                          </div>
                          <p className="text-xs text-white/50">points</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
