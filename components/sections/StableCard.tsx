"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Stable = {
  id: string;
  name: string;
  location: "Giza" | "Saqqara" | string;
  imageUrl: string;
  description?: string;
  rating?: number;
  totalBookings?: number;
};

export default function StableCard({ stable, index }: { stable: Stable; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="will-change-transform hover:shadow-lg transition-shadow"
    >
      <Card className="overflow-hidden h-full">
        {/* Media */}
        <div className="relative w-full aspect-video">
          <Image
            src={stable.imageUrl}
            alt={stable.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            priority={false}
          />
        </div>

        {/* Content */}
        <CardContent className="p-8">
          <h3 className="font-semibold text-2xl text-foreground">{stable.name}</h3>

          <div className="flex items-center gap-2 text-foreground/70 mt-2">
            <MapPin className="h-4 w-4" />
            <span>{stable.location}</span>
          </div>

          {stable.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {stable.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-nile-blue mt-4">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{stable.rating?.toFixed(1) || "4.9"}</span>
            <span className="text-foreground/70 ml-1">({stable.totalBookings || 120} Reviews)</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
