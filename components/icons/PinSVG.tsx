import * as React from "react";

const PinSVG = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <rect width="44" height="44" rx="12" fill="#10b981" />
    {/* Pin body */}
    <path d="M22 13c-4.2 0-7.5 3.18-7.5 7.09 0 5.9 7.13 12.4 7.41 12.64a1 1 0 0 0 1.18 0C22.37 32.5 29.5 26 29.5 20.09 29.5 16.18 26.2 13 22 13zm0 2c3.36 0 6 2.7 6 6.09 0 4.36-5.01 9.18-6 10.01-.99-.83-6-5.65-6-10.01C16 17.7 18.64 15 22 15zm0 2.2a3.1 3.1 0 1 0 .001 6.201A3.1 3.1 0 0 0 22 17.2z" fill="#fff"/>
    {/* Pin dot */}
    <circle cx="22" cy="22.5" r="2" fill="#10b981" />
  </svg>
);

export default PinSVG;
