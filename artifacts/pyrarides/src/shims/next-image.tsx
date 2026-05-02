import React from "react";

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> & {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  fetchPriority?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
};

const NextImage = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ fill, priority, quality, fetchPriority, sizes, className, ...props }, ref) => {
    const style: React.CSSProperties = fill
      ? { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }
      : {};
    return (
      <img
        ref={ref}
        className={className}
        loading={priority ? "eager" : "lazy"}
        style={style}
        {...props}
      />
    );
  }
);

NextImage.displayName = "NextImage";
export default NextImage;
