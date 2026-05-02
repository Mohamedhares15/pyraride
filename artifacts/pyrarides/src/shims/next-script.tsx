import React from "react";

interface ScriptProps {
  src?: string;
  strategy?: string;
  onLoad?: () => void;
  [key: string]: any;
}

export default function Script({ src, onLoad, strategy, ...props }: ScriptProps) {
  React.useEffect(() => {
    if (!src) return;
    const script = document.createElement("script");
    script.src = src;
    Object.entries(props).forEach(([k, v]) => { if (typeof v === "string") script.setAttribute(k, v); });
    if (onLoad) script.onload = onLoad;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [src]);
  return null;
}
