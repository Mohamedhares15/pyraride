export const formatPrice = (amount: number, opts: { currency?: string; compact?: boolean } = {}) => {
  const { currency = "EGP", compact = false } = opts;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
};

export const fmtMoney = (amount: number, opts?: { currency?: string; compact?: boolean }) =>
  formatPrice(amount, opts);

export const formatRating = (n: number) => n.toFixed(1);

export const formatDuration = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
