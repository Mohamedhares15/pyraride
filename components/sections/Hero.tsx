"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Hero() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (date) params.set("date", date);
    window.location.href = `/stables${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background with vibrant gradient */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite"
        }}
      />
      
      {/* Gradient overlay for text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-[1]" />

      {/* Content layer */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-5xl font-bold tracking-tight lg:text-7xl drop-shadow-2xl">
          THE PYRAMIDS, UNFORGETTABLE.
        </h1>
        <h2 className="text-white text-5xl font-bold mt-2 tracking-tight lg:text-7xl drop-shadow-2xl">
          THE RIDE, UNCOMPLICATED.
        </h2>
        <p className="text-white/95 text-xl mt-4 max-w-2xl drop-shadow-md font-light">
          Book your trusted, vetted ride at Giza and Saqqara.
        </p>

        {/* Search form */}
        <form
          onSubmit={onSearch}
          className="mt-8 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-4 w-full max-w-3xl border border-white/50"
        >
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Input
              placeholder="Location (Giza or Saqqara)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="md:flex-1"
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="md:w-56"
            />
            <Button type="submit" variant="primary" className="rounded-full md:w-auto w-full shadow-lg">
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
