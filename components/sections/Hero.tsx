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

export default function Hero() {
  const [location, setLocation] = useState("all");
  const [date, setDate] = useState("");
  
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
    <section className="relative h-screen w-full overflow-hidden hero">
      {/* Horse Riding with Pyramids Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: "url(/hero-bg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        />
        {/* Dark gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>
      
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/10 to-white/5 backdrop-blur-sm z-[1]" />
      
      {/* Additional overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30 z-[2]" />

      {/* Content layer */}
      <div className="relative z-20 h-screen w-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight drop-shadow-2xl">
          THE PYRAMIDS, UNFORGETTABLE.
        </h1>
        <h2 className="text-white text-3xl md:text-5xl lg:text-7xl font-bold mt-2 tracking-tight drop-shadow-2xl">
          THE RIDE, UNCOMPLICATED.
        </h2>
        <p className="text-white/95 text-base md:text-xl mt-4 max-w-2xl drop-shadow-md font-light px-4">
          Book your trusted, vetted ride at Giza and Saqqara.
        </p>
        
        {/* Value Props - Trust indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% Verified Stables</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Safe & Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Best Price Guarantee</span>
          </div>
        </div>

        {/* Search form - Glass effect */}
        <form
          onSubmit={onSearch}
          className="mt-6 md:mt-8 bg-white/20 backdrop-blur-lg rounded-full shadow-2xl p-3 md:p-4 w-full max-w-3xl mx-auto border border-white/30"
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="md:flex-1 w-full rounded-full bg-white/90 backdrop-blur-sm border-white/50 text-left">
                <SelectValue placeholder="Choose location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="giza">Giza Plateau</SelectItem>
                <SelectItem value="saqqara">Saqqara Desert</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="md:w-56 w-full bg-white/90 backdrop-blur-sm border-white/50"
            />
            <Button type="submit" variant="primary" className="rounded-full md:w-auto w-full shadow-lg px-8">
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
