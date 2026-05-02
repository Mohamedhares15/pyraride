import * as React from "react";

const ReceiptSVG = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
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
    {/* Receipt body */}
    <rect x="10" y="14" width="24" height="20" rx="2" fill="#fff" />
    {/* Receipt lines */}
    <line x1="13" y1="18" x2="31" y2="18" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="13" y1="22" x2="31" y2="22" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="13" y1="26" x2="27" y2="26" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
    {/* Tear line */}
    <path d="M10 14 Q12 13 14 14 Q16 13 18 14 Q20 13 22 14 Q24 13 26 14 Q28 13 30 14 Q32 13 34 14" stroke="#2563eb" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

export default ReceiptSVG;

