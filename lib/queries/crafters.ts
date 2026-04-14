// lib/queries/crafters.ts
import prisma from "@/lib/prisma";
import type { ItemType } from "@prisma/client";

export interface CrafterStat {
  id: string;
  name: string;
  active: boolean;
  batchCount: number;
  totalCraftedValue: number;
  totalOwed: number;
  totalPaid: number;
}

export async function getCrafterStats(): Promise<CrafterStat[]> {
  const crafters = await prisma.crafter.findMany({
    orderBy: { name: "asc" },
    include: { batches: true },
  });
  return crafters.map((crafter) => {
    const totalCraftedValue = crafter.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0);
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    const totalOwed = Math.max(0, totalCraftedValue - totalPaid);
    return {
      id: crafter.id,
      name: crafter.name,
      active: (crafter as typeof crafter & { active: boolean }).active,
      batchCount: crafter.batches.length,
      totalCraftedValue,
      totalOwed,
      totalPaid,
    };
  });
}

export interface CrafterDetailBatch {
  id: string;
  itemType: ItemType;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  paidAmount: number;
  craftedAt: Date;
  notes: string | null;
  totalValue: number;
  usedQty: number;
  unusedQty: number;
  outstanding: number;
  isFullyPaid: boolean;
  isPartial: boolean;
}

export interface CrafterDetail {
  id: string;
  name: string;
  characterName: string;
  active: boolean;
  batches: CrafterDetailBatch[];
  totalOwed: number;
  totalPaid: number;
  grandOutstanding: number;
  pct: number;
}

export async function getCrafterDetail(id: string): Promise<CrafterDetail | null> {
  const crafter = await prisma.crafter.findUnique({
    where: { id },
    include: {
      batches: {
        orderBy: { craftedAt: "desc" },
        include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
      },
    },
  });
  if (!crafter) return null;

  const batches: CrafterDetailBatch[] = crafter.batches.map((b) => {
    const totalValue = b.quantity * b.costPerUnit;
    const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const unusedQty = b.quantity - usedQty;
    const outstanding = Math.max(0, totalValue - b.paidAmount);
    const isFullyPaid = b.paidAmount >= totalValue;
    const isPartial = !isFullyPaid && b.paidAmount > 0;
    return { id: b.id, itemType: b.itemType, itemName: b.itemName, quantity: b.quantity, costPerUnit: b.costPerUnit, paidAmount: b.paidAmount, craftedAt: b.craftedAt, notes: b.notes, totalValue, usedQty, unusedQty, outstanding, isFullyPaid, isPartial };
  });

  const totalOwed = batches.reduce((s, b) => s + b.totalValue, 0);
  const totalPaid = batches.reduce((s, b) => s + b.paidAmount, 0);
  const grandOutstanding = Math.max(0, totalOwed - totalPaid);
  const pct = totalOwed > 0 ? Math.min(100, (totalPaid / totalOwed) * 100) : 100;

  return {
    id: crafter.id,
    name: crafter.name,
    characterName: crafter.characterName,
    active: (crafter as typeof crafter & { active: boolean }).active,
    batches,
    totalOwed,
    totalPaid,
    grandOutstanding,
    pct,
  };
}
