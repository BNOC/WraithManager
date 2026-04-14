// lib/queries/usage.ts
import prisma from "@/lib/prisma";

const RAID_DAYS = new Set([1, 3, 4]);
const SEASON_START = "2026-03-18";

function getExpectedRaidNights(until: Date): string[] {
  const nights: string[] = [];
  const start = new Date(`${SEASON_START}T00:00:00.000Z`);
  const cur = new Date(start);
  const end = new Date(Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate()));
  while (cur <= end) {
    if (RAID_DAYS.has(cur.getUTCDay())) nights.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return nights;
}

function toDateKey(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

export interface UsageNightCardLog {
  id: string;
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  notes: string | null;
  lineValue: number;
  unattributed: number;
  lines: { id: string; quantity: number; costPerUnit: number; crafterName: string; batchCraftedAt: string }[];
}

export interface UsageNightCardProps {
  dateKey: string;
  raidDate: string;
  nightValue: number;
  logs: UsageNightCardLog[];
  defaultOpen?: boolean;
}

export interface UsagePageData {
  totalUsed: number;
  totalValue: number;
  nightCount: number;
  nightCards: UsageNightCardProps[];
  missingKeys: Set<string>;
}

export async function getUsagePageData(): Promise<UsagePageData> {
  const logs = await prisma.usageLog.findMany({
    orderBy: { raidDate: "desc" },
    include: { lines: { include: { batch: { include: { crafter: true } } } } },
  });

  const totalUsed = logs.reduce((s, l) => s + l.quantityUsed, 0);
  const totalValue = logs.reduce(
    (s, l) => s + l.lines.reduce((ls, line) => ls + line.quantity * line.costPerUnit, 0),
    0
  );

  const nights = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = toDateKey(log.raidDate);
    if (!nights.has(key)) nights.set(key, []);
    nights.get(key)!.push(log);
  }
  const nightEntries = [...nights.entries()];

  const loggedKeys = new Set(nightEntries.map(([k]) => k));
  const expectedNights = getExpectedRaidNights(new Date());
  const missingKeys = new Set(expectedNights.filter((k) => !loggedKeys.has(k)));

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

  return { totalUsed, totalValue, nightCount: nightEntries.length, nightCards, missingKeys };
}
