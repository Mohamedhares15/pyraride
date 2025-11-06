import * as React from "react";

const CalendarSVG = ({ 
  className = "", 
  style = {},
  day 
}: { 
  className?: string; 
  style?: React.CSSProperties;
  day?: number;
}) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <rect width="44" height="44" rx="12" fill="#2563eb" />
    <rect x="10" y="16" width="24" height="16" rx="4" fill="#fff" />
    <rect x="10" y="13" width="24" height="5" rx="2" fill="#1d4ed8" />
    <rect x="15" y="12" width="2.5" height="4" rx="1.25" fill="#2563eb" />
    <rect x="26.5" y="12" width="2.5" height="4" rx="1.25" fill="#2563eb" />
    {day && (
      <text 
        x="50%" 
        y="65%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        fontSize="14" 
        fill="#2563eb"
      >
        {day}
      </text>
    )}
  </svg>
);

export default CalendarSVG;
