"use client";

import Link from "next/link";
import { RaidDayBadge } from "@/components/RaidDayBadge";

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function MissingNightRow({ dateKey }: { dateKey: string }) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  return (
    <div
      className="border border-dashed border-primary/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: "repeating-linear-gradient(-45deg, transparent, transparent 8px, color-mix(in srgb, var(--theme-primary) 12%, transparent) 8px, color-mix(in srgb, var(--theme-primary) 12%, transparent) 16px)",
      }}
    >
      <div className="flex items-center gap-3">
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-ink-faint shrink-0" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
        <RaidDayBadge date={date} />
        <span className="text-ink-dim text-sm">{formatDate(dateKey)}</span>
        <span className="text-ink-faint text-xs">Missing Record</span>
      </div>
      <Link
        href={`/usage/new?date=${dateKey}`}
        className="text-xs text-primary/70 hover:text-primary border border-primary/30 hover:border-primary/60 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
      >
        + Add night
      </Link>
    </div>
  );
}
