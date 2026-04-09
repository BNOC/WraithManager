const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RaidDayBadge({ date }: { date: Date | null }) {
  if (!date) return null;
  const label = DAY_LABELS[new Date(date).getDay()];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
      {label}
    </span>
  );
}
