"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface FavoritesButtonProps {
  itemId: string;
  itemType: "stable" | "horse" | "studio";
  className?: string;
}

export default function FavoritesButton({
  itemId,
  itemType,
  className,
}: FavoritesButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      // Check if item is favorited
      fetch(`/api/favorites?itemId=${itemId}&type=${itemType}`)
        .then((res) => res.json())
        .then((data) => setIsFavorited(data.isFavorited || false));
    }
  }, [session, itemId, itemType]);

  const handleToggle = async () => {
    if (!session) {
      // Open auth modal
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${itemId}`, {
          method: "DELETE",
        });
        setIsFavorited(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, type: itemType }),
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "hover:bg-red-50",
        isFavorited && "text-red-500 hover:text-red-600",
        className
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isFavorited && "fill-red-500"
        )}
      />
    </Button>
  );
}

