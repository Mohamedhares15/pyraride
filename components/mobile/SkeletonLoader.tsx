"use client";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "image" | "circle";
  width?: string;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({
  variant = "card",
  width,
  height,
  className = "",
}: SkeletonLoaderProps) {
  const baseStyles = "skeleton bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200";
  
  const variants = {
    card: "rounded-2xl",
    text: "rounded h-4",
    image: "rounded-2xl aspect-video",
    circle: "rounded-full",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        width: width || (variant === "circle" ? "48px" : "100%"),
        height: height || (variant === "circle" ? "48px" : variant === "text" ? "16px" : "200px"),
      }}
      aria-label="Loading"
    />
  );
}

