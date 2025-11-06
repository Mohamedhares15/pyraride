"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  interactive?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  interactive = true,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (value: number) => {
    if (interactive) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-1">
      {stars.map((value) => (
        <motion.button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={!interactive}
          className="transition-all hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
          whileHover={interactive ? { scale: 1.2 } : {}}
          whileTap={interactive ? { scale: 0.95 } : {}}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              value <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground"
            } ${
              interactive
                ? "cursor-pointer hover:text-yellow-400"
                : "cursor-default"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

