import * as React from "react";

const HorseHeadSVG = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <rect width="44" height="44" rx="12" fill="#8b5cf6" />
    {/* Horse head silhouette */}
    <path
      d="M22 14c-3 0-5.5 1.5-6.5 3.5-1-1-2.5-1.5-3.5-1-1 .5-1.5 1.5-1 2.5.5 1 1.5 1.5 2.5 1 .8-.3 1.5-.8 2-1.5.5 1 1.5 2 3 2.5 1.5.5 3 .5 4 0 .8.5 1.8.8 3 .8 1.2 0 2.2-.3 3-.8 1 .5 2.5.5 4 0 1.5-.5 2.5-1.5 3-2.5.5.7 1.2 1.2 2 1.5 1 .5 2 .5 2.5-1 .5-1 0-2-1-2.5-1-.5-2.5 0-3.5 1-1-2-3.5-3.5-6.5-3.5z"
      fill="#fff"
    />
    {/* Eye */}
    <circle cx="19" cy="20" r="1.5" fill="#8b5cf6" />
    {/* Ear */}
    <path d="M16 16l1 2-1 1v-3z" fill="#fff" />
    <path d="M28 16l-1 2 1 1v-3z" fill="#fff" />
    {/* Muzzle detail */}
    <ellipse cx="22" cy="26" rx="3" ry="2" fill="#fff" opacity="0.9" />
  </svg>
);

export default HorseHeadSVG;

