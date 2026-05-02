"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/shims/next-auth-react";
import { useRouter } from "@/shims/next-navigation";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Gift, TrendingUp, ArrowRight, Crown } from "lucide-react";

interface LoyaltyData {
  points: number;
  tier: string;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
  nextTier: string | null;
  pointsToNextTier: number | null;
  redemptionValue: number;
}

const TIERS = [
  { key: "bronze", label: "Bronze", minPoints: 0, maxPoints: 500, color: "#CD7F32", glow: "rgba(205,127,50,0.4)", icon: "🥉" },
  { key: "silver", label: "Silver", minPoints: 500, maxPoints: 1500, color: "#C0C0C0", glow: "rgba(192,192,192,0.4)", icon: "🥈" },
  { key: "gold", label: "Gold", minPoints: 1500, maxPoints: 3500, color: "#DAA520", glow: "rgba(218,165,32,0.5)", icon: "🥇" },
  { key: "platinum", label: "Platinum", minPoints: 3500, maxPoints: 7000, color: "#9B59B6", glow: "rgba(155,89,182,0.5)", icon: "💎" },
];

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function TierRing({
  tier,
  isCurrent,
  isCompleted,
  progress,
  points,
  delay,
}: {
  tier: typeof TIERS[0];
  isCurrent: boolean;
  isCompleted: boolean;
  progress: number;
  points: number;
  delay: number;
}) {
  const ref = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      setAnimatedProgress(isCompleted ? 1 : progress);
    }, delay * 1000 + 200);
    return () => clearTimeout(timer);
  }, [inView, progress, isCompleted, delay]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - animatedProgress);
  const ringColor = isCompleted || isCurrent ? tier.color : "rgba(255,255,255,0.15)";
  const strokeWidth = isCurrent ? 9 : 6;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.15 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative" style={{ filter: isCurrent ? `drop-shadow(0 0 16px ${tier.glow})` : "none" }}>
        <svg viewBox="0 0 120 120" width={isCurrent ? 148 : 112} height={isCurrent ? 148 : 112}>
          <defs>
            <linearGradient id={`grad-${tier.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.color} stopOpacity="1" />
              <stop offset="100%" stopColor={tier.color} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />

          <circle
            ref={ref}
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={`url(#grad-${tier.key})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) ${delay * 0.15}s` }}
          />

          {isCurrent && (
            <>
              <circle cx="60" cy="60" r={RADIUS - 14} fill="none" stroke={tier.color} strokeOpacity="0.08" strokeWidth="1" />
              <circle cx="60" cy="60" r="22" fill={`${tier.color}18`} />
            </>
          )}

          <text x="60" y="55" textAnchor="middle" style={{ fontSize: isCurrent ? "22px" : "18px", dominantBaseline: "middle" }}>
            {tier.icon}
          </text>
          <text
            x="60" y="72"
            textAnchor="middle"
            style={{
              fill: isCurrent ? tier.color : "rgba(255,255,255,0.5)",
              fontSize: isCurrent ? "9px" : "8px",
              fontWeight: isCurrent ? "700" : "400",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {tier.label}
          </text>
        </svg>

        {isCurrent && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay * 0.15 + 0.5, type: "spring", stiffness: 200 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: tier.color }}
          >
            <Crown className="w-3 h-3 text-black" />
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <p className={`text-xs font-semibold uppercase tracking-widest ${isCurrent ? "text-white" : "text-white/40"}`}>
          {tier.label}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5">{tier.minPoints.toLocaleString()}+ pts</p>
      </div>
    </motion.div>
  );
}

export default function LoyaltyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?redirect=/dashboard/loyalty");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/loyalty")
        .then((r) => r.json())
        .then((d) => setLoyalty(d))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#DAA520]/30 border-t-[#DAA520] animate-spin" />
          <p className="text-white/40 text-sm tracking-widest uppercase">Loading rewards</p>
        </div>
      </div>
    );
  }

  if (!loyalty) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/50">Failed to load loyalty data.</p>
          <Button onClick={() => window.location.reload()} className="bg-[#DAA520] text-black">Retry</Button>
        </div>
      </div>
    );
  }

  const currentTierIndex = TIERS.findIndex((t) => t.key === loyalty.tier.toLowerCase());
  const currentTier = TIERS[currentTierIndex] ?? TIERS[0];
  const nextTierData = TIERS[currentTierIndex + 1] ?? null;

  const tierProgress = (() => {
    const range = currentTier.maxPoints - currentTier.minPoints;
    const earned = loyalty.points - currentTier.minPoints;
    return Math.min(1, Math.max(0, earned / range));
  })();

  const HOW_TO_EARN = [
    { icon: Trophy, label: "Book a Ride", pts: "+100 pts", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Star, label: "Leave a Review", pts: "+50 pts", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: Gift, label: "Refer a Friend", pts: "+200 pts", color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${currentTier.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-2"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">Circle Loyalty Programme</p>
          <h1 className="text-4xl font-display font-bold tracking-tight">Your Rewards Circle</h1>
          <p className="text-white/50 text-sm">Earn points on every experience and ascend through the tiers</p>
        </motion.div>

        {/* Tier Rings Row */}
        <div className="flex items-end justify-center gap-4 sm:gap-8 flex-wrap">
          {TIERS.map((tier, i) => {
            const isCurrent = tier.key === loyalty.tier.toLowerCase();
            const isCompleted = i < currentTierIndex;
            const progress = isCurrent ? tierProgress : isCompleted ? 1 : 0;
            return (
              <TierRing
                key={tier.key}
                tier={tier}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                progress={progress}
                points={loyalty.points}
                delay={i}
              />
            );
          })}
        </div>

        {/* Points + Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative rounded-2xl border overflow-hidden"
          style={{ borderColor: `${currentTier.color}30`, background: `linear-gradient(135deg, ${currentTier.color}0A 0%, rgba(0,0,0,0) 60%)` }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 80% at 100% 0%, ${currentTier.glow} 0%, transparent 70%)`, opacity: 0.3 }} />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1 space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Total Balance</p>
              <p className="text-6xl font-bold tracking-tight" style={{ color: currentTier.color }}>
                {loyalty.points.toLocaleString()}
              </p>
              <p className="text-white/40 text-sm">points · worth <span className="text-white/70">EGP {loyalty.redemptionValue}</span> in discounts</p>
            </div>

            <div className="w-full sm:w-64 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50 uppercase tracking-widest">{currentTier.label}</span>
                {nextTierData && (
                  <span className="text-xs text-white/50 uppercase tracking-widest">{nextTierData.label}</span>
                )}
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${currentTier.color}, ${nextTierData?.color ?? currentTier.color})` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${tierProgress * 100}%` }}
                  transition={{ duration: 1.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              {nextTierData ? (
                <p className="text-xs text-white/40 text-right">
                  {loyalty.pointsToNextTier?.toLocaleString()} pts to <span style={{ color: nextTierData.color }}>{nextTierData.label}</span>
                </p>
              ) : (
                <p className="text-xs text-right" style={{ color: currentTier.color }}>Maximum tier reached</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* How to Earn */}
        <div className="space-y-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/30">How to Earn</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_TO_EARN.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i + 0.4 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{item.label}</p>
                  <p className="text-xs text-white/40">{item.pts}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" /> Recent Activity
          </p>

          {loyalty.transactions.length === 0 ? (
            <div className="text-center py-16 border border-white/8 rounded-xl space-y-4">
              <p className="text-white/30 text-sm">No activity yet. Book your first ride to earn points.</p>
              <Button
                className="bg-[#DAA520] hover:bg-[#DAA520]/90 text-black text-xs tracking-widest uppercase"
                onClick={() => router.push("/stables")}
              >
                Browse Stables <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {loyalty.transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-white text-sm">{tx.description}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Badge
                    className={`font-mono text-xs ${
                      tx.amount > 0
                        ? "bg-green-500/15 text-green-400 border-green-500/20"
                        : "bg-red-500/15 text-red-400 border-red-500/20"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
