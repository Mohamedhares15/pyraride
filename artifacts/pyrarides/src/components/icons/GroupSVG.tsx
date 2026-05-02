import * as React from "react";

const GroupSVG = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
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
    {/* Head 1 */}
    <circle cx="15.5" cy="22.5" r="4" fill="#fff" />
    {/* Head 2 */}
    <circle cx="28.5" cy="22.5" r="4" fill="#fff" opacity="0.8" />
    {/* Shoulder 1 */}
    <ellipse cx="15.5" cy="30.5" rx="7" ry="4" fill="#fff" />
    {/* Shoulder 2 */}
    <ellipse cx="28.5" cy="30.5" rx="7" ry="4" fill="#fff" opacity="0.8" />
  </svg>
);

export default GroupSVG;
