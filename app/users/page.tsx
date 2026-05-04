"use client";
import Link from "next/link";

export default function StubPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
      <div className="max-w-2xl text-center">
        <p className="text-[11px] tracking-luxury uppercase ink-muted">The cercle</p>
        <h1 className="mt-5 font-display text-5xl md:text-6xl leading-[1.02] text-balance">Users.</h1>
        <p className="mt-6 ink-soft text-pretty">A directory of riders, captains and stewards.</p>
        <Link href="/leaderboard" className="mt-10 inline-block border-b hairline pb-1 text-[11px] tracking-luxury uppercase hover:border-foreground">Browse leaderboard →</Link>
      </div>
    </div>
  );
}
