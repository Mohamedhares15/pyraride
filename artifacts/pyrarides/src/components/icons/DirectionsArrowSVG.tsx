import * as React from "react";

const DirectionsArrowSVG = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981"/>
        <stop offset="1" stopColor="#2563eb"/>
      </linearGradient>
    </defs>
    <path d="M6 16h16.34l-5.3-5.29a1 1 0 1 1 1.42-1.42l7 7a1 1 0 0 1 0 1.42l-7 7a1 1 0 1 1-1.42-1.42l5.3-5.29H6a1 1 0 1 1 0-2z"
      fill="url(#g1)"/>
  </svg>
);

export default DirectionsArrowSVG;
