"use client";

import Image from "next/image";
import Link from "next/link";
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
  startingPrice?: number;
  distanceKm?: number;
  pricePerHour?: number;
};

interface StableCardProps {
  stable: Stable;
  index?: number;
  href?: string;
}

export default function StableCard({ stable, index, href }: StableCardProps) {
  // Default image if none provided
  const defaultImage = "/hero-bg.webp";
  const imageSrc = stable.imageUrl && stable.imageUrl !== "" ? stable.imageUrl : defaultImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="will-change-transform hover:shadow-lg transition-shadow h-full"
    >
      <Link href={href ?? `/stables/${stable.id}`} className="block h-full">
        <Card className="overflow-hidden h-full cursor-pointer">
          {/* Media */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
            {stable.imageUrl && stable.imageUrl !== "" ? (
              <Image
                src={imageSrc}
                alt={stable.name}
                fill
                className="object-cover"
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                priority={index !== undefined && index < 6}
                loading={index !== undefined && index >= 6 ? "lazy" : undefined}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-2 text-4xl">🐴</div>
                  <p className="text-sm text-muted-foreground">{stable.name}</p>
                </div>
              </div>
            )}
          </div>

        {/* Content */}
        <CardContent className="p-4 md:p-8">
          <h3 className="font-semibold text-lg md:text-2xl text-foreground">{stable.name}</h3>

          <div className="flex items-center gap-2 text-xs md:text-sm text-foreground/70 mt-2">
            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
            <span>{stable.location}</span>
          </div>

          {stable.pricePerHour !== undefined && (
            <div className="mt-3 text-sm font-semibold text-primary">
              EGP {stable.pricePerHour.toFixed(0)}/hour
            </div>
          )}

          {stable.description && (
            <p className="mt-3 text-xs md:text-sm text-muted-foreground line-clamp-2">
              {stable.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-nile-blue mt-3 md:mt-4">
            <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
            <span className="font-semibold text-sm md:text-base">{stable.rating?.toFixed(1) || "4.9"}</span>
            <span className="text-xs md:text-sm text-foreground/70 ml-1">({stable.totalBookings || 120} Reviews)</span>
          </div>

          {(stable.startingPrice !== undefined || stable.distanceKm !== undefined) && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs md:text-sm text-foreground/70">
              {stable.startingPrice !== undefined && (
                <span>From ${stable.startingPrice.toFixed(0)} / hour</span>
              )}
              {stable.distanceKm !== undefined && (
                <span>{stable.distanceKm} km from central Giza</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </Link>
    </motion.div>
  );
}
