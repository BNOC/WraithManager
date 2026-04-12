export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { UsageNightCard } from "@/components/UsageNightCard";
import { MissingNightRow } from "@/components/MissingNightRow";
import type { UsageNightCardProps } from "@/components/UsageNightCard";

// Raid days: 1=Mon, 3=Wed, 4=Thu (UTC day-of-week)
const RAID_DAYS = new Set([1, 3, 4]);
const SEASON_START = "2026-03-18"; // first logged raid night

function getExpectedRaidNights(until: Date): string[] {
  const nights: string[] = [];
  const start = new Date(`${SEASON_START}T00:00:00.000Z`);
  const cur = new Date(start);
  // Normalize 'until' to midnight UTC
  const end = new Date(Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate()));
  while (cur <= end) {
    if (RAID_DAYS.has(cur.getUTCDay())) {
      nights.push(cur.toISOString().slice(0, 10));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return nights;
}

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function toDateKey(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function UsagePage() {
  const logs = await prisma.usageLog.findMany({
    orderBy: { raidDate: "desc" },
    include: {
      lines: {
        include: { batch: { include: { crafter: true } } },
      },
    },
  });

  const totalUsed = logs.reduce((s, l) => s + l.quantityUsed, 0);
  const totalValue = logs.reduce(
    (s, l) => s + l.lines.reduce((ls, line) => ls + line.quantity * line.costPerUnit, 0),
    0
  );

  // Group logs by raidDate
  const nights = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = toDateKey(log.raidDate);
    if (!nights.has(key)) nights.set(key, []);
    nights.get(key)!.push(log);
  }
  const nightEntries = [...nights.entries()];

  // Expected nights from season start to today — find gaps
  const loggedKeys = new Set(nightEntries.map(([k]) => k));
  const expectedNights = getExpectedRaidNights(new Date());
  const missingKeys = new Set(expectedNights.filter((k) => !loggedKeys.has(k)));

  // Serialize to plain objects for client components
  const nightCards: UsageNightCardProps[] = nightEntries.map(([dateKey, nightLogs]) => {
    const nightValue = nightLogs.reduce(
      (s, log) => s + log.lines.reduce((ls, l) => ls + l.quantity * l.costPerUnit, 0),
      0
    );
    return {
      dateKey,
      raidDate: nightLogs[0].raidDate.toISOString(),
      nightValue,
      logs: nightLogs.map((log) => {
        const lineValue = log.lines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
        const unattributed = log.quantityUsed - log.lines.reduce((s, l) => s + l.quantity, 0);
        return {
          id: log.id,
          itemType: log.itemType,
          itemName: log.itemName,
          quantityUsed: log.quantityUsed,
          notes: log.notes,
          lineValue,
          unattributed,
          lines: log.lines.map((line) => ({
            id: line.id,
            quantity: line.quantity,
            costPerUnit: line.costPerUnit,
            crafterName: line.batch.crafter.name,
            batchCraftedAt: line.batch.craftedAt.toISOString(),
          })),
        };
      }),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Usage Log</p>
          <h1 className="text-3xl font-bold text-ink">Usage</h1>
          <p className="text-ink-dim mt-1 text-sm">
            {nightEntries.length} raid night{nightEntries.length !== 1 ? "s" : ""} · {totalUsed} items used · {formatGold(totalValue)} total spent
          </p>
        </div>
        <Link
          href="/usage/new"
          className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm shrink-0"
        >
          + Log Raid Night
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="bg-surface border border-rim rounded-2xl p-12 text-center shadow-lg shadow-black/30">
          <p className="text-ink-dim text-lg">No usage logged yet.</p>
          <Link href="/usage/new" className="mt-4 inline-block text-primary hover:opacity-80">
            Log first raid night →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            // Merge logged and missing into one desc-sorted list
            const allKeys = [...new Set([...nightCards.map((c) => c.dateKey), ...missingKeys])]
              .sort((a, b) => b.localeCompare(a));

            const cardMap = new Map(nightCards.map((c) => [c.dateKey, c]));
            let loggedCount = 0;

            return allKeys.map((dateKey) => {
              const card = cardMap.get(dateKey);
              if (card) {
                const isFirst = loggedCount === 0;
                loggedCount++;
                return <UsageNightCard key={dateKey} {...card} defaultOpen={isFirst} />;
              }
              return <MissingNightRow key={dateKey} dateKey={dateKey} />;
            });
          })()}
        </div>
      )}
    </div>
  );
}
