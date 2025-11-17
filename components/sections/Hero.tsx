"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";

export default function Hero() {
  const getToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60000);
    return local.toISOString().split("T")[0];
  };

  const [location, setLocation] = useState("all");
  const [date, setDate] = useState(getToday);

  const displayDate = (value: string) => {
    if (!value) return "Select date";
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return formatter.format(new Date(value));
  };
  
  // Prevent scrolling on homepage only
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location && location !== "all") params.set("location", location);
    if (date) params.set("date", date);
    window.location.href = `/stables${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Horse Riding with Pyramids Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: "url(/hero-bg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Glass effect overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/5 via-white/10 to-white/5 backdrop-blur-sm" />

      {/* Additional overlay for better text contrast */}
      <div className="absolute inset-0 z-[2] bg-black/30" />

      {/* Content layer */}
      <div className="relative z-20 min-h-screen w-full px-4">
        <div className="flex min-h-screen w-full flex-col items-center justify-between text-center pt-24 pb-[calc(env(safe-area-inset-bottom)+24px)] md:justify-center md:pt-0 md:pb-0">
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            {/* Desktop headline */}
            <div className="hidden flex-col items-center justify-center text-center md:flex">
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-2xl md:text-5xl lg:text-7xl">
                THE PYRAMIDS, UNFORGETTABLE.
              </h1>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white drop-shadow-2xl md:text-5xl lg:text-7xl">
                THE RIDE, UNCOMPLICATED.
              </h2>
              <p className="mt-4 max-w-2xl px-4 text-base font-light text-white/95 drop-shadow-md md:text-xl">
                Book your trusted, vetted ride at Giza and Saqqara.
              </p>
            </div>

            {/* Mobile hero aesthetic */}
            <div className="flex w-full flex-col items-center gap-6 text-white md:hidden">
              <div className="flex w-full items-center justify-center gap-4 text-[11px] font-semibold uppercase tracking-[0.6em] text-white/70">
                <span className="hero-dash-line flex-1 max-w-[72px]" />
                <span>PYRARIDE</span>
                <span className="hero-dash-line flex-1 max-w-[72px]" />
              </div>

              <div className="relative space-y-2 text-center text-[42px] font-semibold leading-[46px] tracking-[0.04em] drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
                <span className="block">Ride Into</span>
                <span className="block">Adventure!</span>
              </div>

              <div className="flex w-full max-w-xs items-center justify-center gap-4">
                <span className="hero-dash-line flex-1 max-w-[72px]" />
                <span className="h-2 w-2 rounded-full border border-white/40 bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.45)]" />
                <span className="hero-dash-line flex-1 max-w-[72px]" />
              </div>
            </div>
          </div>

          {/* Value props for desktop */}
          <div className="mt-6 hidden flex-wrap items-center justify-center gap-6 text-sm text-white/90 md:flex">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>100% Verified Stables</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Safe & Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Best Price Guarantee</span>
            </div>
          </div>

          {/* Search form */}
          <div className="w-full max-w-md pt-10 md:mt-8 md:max-w-3xl md:pt-0">
            <form
              onSubmit={onSearch}
              className="relative w-full rounded-[28px] border border-white/20 bg-black/60 p-5 text-left shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-lg transition-all duration-300 md:rounded-full md:border-white/30 md:bg-white/20 md:p-4 md:text-center md:shadow-2xl"
            >
              <div className="mb-4 space-y-1 md:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-[0.55em] text-white/60">
                  Booking
                </p>
                <p className="text-base font-medium text-white">
                  Trusted rides in Giza & Saqqara
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="!h-[56px] rounded-2xl border border-white/30 bg-white/5 px-4 text-left text-base text-white placeholder-white/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60 md:!h-12 md:flex-1 md:rounded-full md:border-white/50 md:bg-white/90 md:text-foreground md:focus:ring-ring">
                    <SelectValue placeholder="Choose location" />
                  </SelectTrigger>
                  <SelectContent className="z-[120] border-white/15 bg-black/90 text-white md:border-border md:bg-card md:text-foreground">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="giza">Giza Plateau</SelectItem>
                    <SelectItem value="saqqara">Saqqara Desert</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative w-full md:w-56">
                  <div className="flex !h-[56px] w-full items-center justify-between rounded-2xl border border-white/30 bg-white/5 px-4 text-left text-base text-white transition-all duration-200 focus-within:border-white/70 focus-within:ring-2 focus-within:ring-white/60 md:!h-12 md:rounded-full md:border-white/50 md:bg-white/90 md:text-foreground md:focus-within:ring-ring">
                    <span>{displayDate(date)}</span>
                    <CalendarDays className="h-4 w-4 text-white/70 md:text-foreground/60" aria-hidden="true" />
                  </div>
                  <Input
                    type="date"
                    aria-label="Select ride date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="relative z-[80] !h-[56px] w-full rounded-2xl border border-white/30 !bg-white !text-black text-[11px] font-semibold uppercase tracking-[0.35em] shadow-lg transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] md:!h-12 md:w-auto md:rounded-full md:border-transparent md:px-8 md:tracking-normal md:!bg-primary md:!text-white md:text-base"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
