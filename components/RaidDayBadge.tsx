const RAID_DAYS = [1, 3, 4]; // Monday=1, Wednesday=3, Thursday=4

function getRaidDayLabel(date: Date): string | null {
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (day === 1) return "Mon";
  if (day === 3) return "Wed";
  if (day === 4) return "Thu";
  return null;
}

export function RaidDayBadge({ date }: { date: Date | null }) {
  if (!date) return null;
  const d = new Date(date);
  const label = getRaidDayLabel(d);
  if (!label) return null;

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
      {label}
    </span>
  );
}

export function isRaidDay(date: Date): boolean {
  const day = new Date(date).getDay();
  return RAID_DAYS.includes(day);
}
