// lib/queries/dashboard.ts
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";

export interface CrafterSummary {
  id: string;
  characterName: string;
  active: boolean;
  totalOwed: number;
  totalPaid: number;
  outstanding: number;
}

export interface InventoryItem {
  itemType: ItemType;
  itemName: string;
  remaining: number;
  total: number;
  remainingValue: number;
}

export interface DashboardData {
  crafterSummaries: CrafterSummary[];
  activeSummaries: CrafterSummary[];
  grandOutstanding: number;
  grandTotalPaid: number;
  grandTotalCost: number;
  grandWastedValue: number;
  inventory: InventoryItem[];
  totalInventoryValue: number;
  breakdown: Map<string, { crafterName: string; remaining: number }[]>;
  recentBatches: {
    id: string;
    itemType: ItemType;
    itemName: string;
    quantity: number;
    costPerUnit: number;
    craftedAt: Date;
    crafter: { characterName: string };
  }[];
  recentUsage: {
    id: string;
    itemType: ItemType;
    itemName: string | null;
    quantityUsed: number;
    raidDate: Date;
    lines: { quantity: number; costPerUnit: number; batch: { crafter: { name: string } } }[];
  }[];
}

const TYPE_ORDER: Record<string, number> = { FLASK_CAULDRON: 0, POTION_CAULDRON: 1, FEAST: 2, VANTUS_RUNE: 3, OTHER: 4 };

const PINNED: { type: ItemType; name: string }[] = [
  { type: "FLASK_CAULDRON", name: "Flask Cauldron" },
  { type: "POTION_CAULDRON", name: "Potion Cauldron" },
  { type: "VANTUS_RUNE", name: "Vantus Rune" },
];

export async function getDashboardData(): Promise<DashboardData> {
  const [crafters, recentBatches, recentUsage, allBatches] = await Promise.all([
    prisma.crafter.findMany({
      include: {
        batches: {
          include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
        },
      },
    }),
    prisma.craftBatch.findMany({
      orderBy: { craftedAt: "desc" },
      take: 5,
      include: { crafter: true },
    }),
    prisma.usageLog.findMany({
      orderBy: { raidDate: "desc" },
      take: 5,
      include: { lines: { include: { batch: { include: { crafter: true } } } } },
    }),
    prisma.craftBatch.findMany({
      include: {
        usageLines: { select: { quantity: true } },
        crafter: { select: { active: true, characterName: true } },
      },
    }),
  ]);

  const crafterSummaries: CrafterSummary[] = crafters.map((crafter) => {
    const totalOwed = crafter.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0);
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    const outstanding = Math.max(0, totalOwed - totalPaid);
    return {
      id: crafter.id,
      characterName: crafter.characterName,
      active: (crafter as typeof crafter & { active: boolean }).active,
      totalOwed,
      totalPaid,
      outstanding,
    };
  });

  const activeSummaries = crafterSummaries.filter((c) => c.active);
  const grandOutstanding = crafterSummaries.reduce((s, c) => s + c.outstanding, 0);
  const grandTotalPaid = crafterSummaries.reduce((s, c) => s + c.totalPaid, 0);
  const grandTotalCost = allBatches.reduce(
    (s: number, b: { costPerUnit: number; usageLines: { quantity: number }[] }) => {
      const used = b.usageLines.reduce((u: number, l: { quantity: number }) => u + l.quantity, 0);
      return s + used * b.costPerUnit;
    },
    0
  );

  type BatchCrafter = { active: boolean; characterName: string };
  const inventoryMap = new Map<string, InventoryItem>();
  const breakdownRaw = new Map<string, Map<string, number>>();
  let grandWastedValue = 0;

  for (const b of allBatches) {
    const crafter = b.crafter as BatchCrafter;
    const isWarbound = b.itemType !== "VANTUS_RUNE";
    if (isWarbound && !crafter.active) {
      const used = b.usageLines.reduce((s, l) => s + l.quantity, 0);
      grandWastedValue += (b.quantity - used) * b.costPerUnit;
      continue;
    }
    const used = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const remaining = b.quantity - used;
    const key = `${b.itemType}::${b.itemName}`;
    if (!inventoryMap.has(key))
      inventoryMap.set(key, { itemType: b.itemType, itemName: b.itemName, remaining: 0, total: 0, remainingValue: 0 });
    const entry = inventoryMap.get(key)!;
    entry.remaining += remaining;
    entry.total += b.quantity;
    entry.remainingValue += remaining * b.costPerUnit;
    if (remaining > 0) {
      const bKey = b.itemType === "FEAST" ? "FEAST::Feast" : key;
      if (!breakdownRaw.has(bKey)) breakdownRaw.set(bKey, new Map());
      const cm = breakdownRaw.get(bKey)!;
      const label =
        b.itemType === "VANTUS_RUNE"
          ? "Guild Bank"
          : crafter.active
          ? crafter.characterName
          : `${crafter.characterName} (inactive)`;
      cm.set(label, (cm.get(label) ?? 0) + remaining);
    }
  }

  for (const { type, name } of PINNED) {
    const key = `${type}::${name}`;
    if (!inventoryMap.has(key))
      inventoryMap.set(key, { itemType: type, itemName: name, remaining: 0, total: 0, remainingValue: 0 });
  }

  // Return individual feast items (not aggregated) so the page's feast-breakdown IIFE works unchanged
  const inventory = [...inventoryMap.values()].sort(
    (a, b) => (TYPE_ORDER[a.itemType] ?? 9) - (TYPE_ORDER[b.itemType] ?? 9) || a.itemName.localeCompare(b.itemName)
  );

  const totalInventoryValue = inventory.reduce((s, i) => s + i.remainingValue, 0);

  const breakdown = new Map<string, { crafterName: string; remaining: number }[]>();
  for (const [key, cm] of breakdownRaw) {
    breakdown.set(key, [...cm.entries()].map(([crafterName, remaining]) => ({ crafterName, remaining })));
  }

  return {
    crafterSummaries,
    activeSummaries,
    grandOutstanding,
    grandTotalPaid,
    grandTotalCost,
    grandWastedValue,
    inventory,
    totalInventoryValue,
    breakdown,
    recentBatches,
    recentUsage,
  };
}
