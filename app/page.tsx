"use client";

import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Star, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const stats = [
    { value: "1.2K+", label: "Rides Booked", icon: Calendar },
    { value: "24", label: "Partner Stables", icon: Users },
    { value: "4.9", label: "Average Rating", icon: Star },
    { value: "98%", label: "Satisfaction", icon: TrendingUp },
  ];

  return (
    <>
      <Navbar />
      <Hero />

      {/* Quick Stats - Horizontal Scroll Carousel */}
      <div className="mobile-container safe-padding py-6 hide-fab safe-area-wrapper">
        <div className="stats-row overflow-x-auto pb-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="stat-card flex-shrink-0"
              >
                <Icon className="text-primary mx-auto mb-1" />
                <div className="font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Sticky Bottom CTA */}
        <div className="sticky-bottom-cta md:hidden">
          <Link href="/stables">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold"
            >
              BOOK YOUR RIDE NOW
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
