// lib/queries/consumables.ts
import prisma from "@/lib/prisma";
import type { ItemType } from "@prisma/client";

export interface ConsumableRow {
  id: string;
  itemType: ItemType;
  itemName: string;
  notes: string | null;
  quantity: number;
  costPerUnit: number;
  paidAmount: number;
  craftedAt: Date;
  usedQty: number;
  usedValue: number;
  remaining: number;
  totalValue: number;
  owedAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  crafterActive: boolean;
  isWarbound: boolean;
  isWasted: boolean;
  crafter: { id: string; name: string; characterName: string; active: boolean };
}

export interface ConsumablesData {
  crafters: { id: string; name: string }[];
  rows: ConsumableRow[];
}

const VALID_TYPES = ["FLASK_CAULDRON", "POTION_CAULDRON", "FEAST", "VANTUS_RUNE", "OTHER"];

export async function getConsumablesData(filters: {
  crafter?: string;
  type?: string;
  hideEmpty?: boolean;
}): Promise<ConsumablesData> {
  const crafters = await prisma.crafter.findMany({ orderBy: { name: "asc" } });

  const where: Record<string, unknown> = {};
  if (filters.crafter) where.crafterId = filters.crafter;
  if (filters.type && VALID_TYPES.includes(filters.type)) {
    where.itemType = filters.type as ItemType;
  }

  const batches = await prisma.craftBatch.findMany({
    where,
    orderBy: { craftedAt: "desc" },
    include: {
      crafter: true,
      usageLines: { select: { quantity: true, costPerUnit: true } },
    },
  });

  const rows: ConsumableRow[] = batches.map((b) => {
    const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const usedValue = b.usageLines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
    const remaining = b.quantity - usedQty;
    const totalValue = b.quantity * b.costPerUnit;
    const owedAmount = totalValue;
    const paymentStatus: "paid" | "partial" | "unpaid" =
      b.paidAmount >= owedAmount && owedAmount > 0
        ? "paid"
        : b.paidAmount > 0
        ? "partial"
        : "unpaid";
    const crafterActive = (b.crafter as typeof b.crafter & { active: boolean }).active;
    const isWarbound = b.itemType !== "VANTUS_RUNE";
    const isWasted = !crafterActive && remaining > 0 && isWarbound;
    return {
      id: b.id,
      itemType: b.itemType,
      itemName: b.itemName,
      notes: b.notes,
      quantity: b.quantity,
      costPerUnit: b.costPerUnit,
      paidAmount: b.paidAmount,
      craftedAt: b.craftedAt,
      usedQty,
      usedValue,
      remaining,
      totalValue,
      owedAmount,
      paymentStatus,
      crafterActive,
      isWarbound,
      isWasted,
      crafter: {
        id: b.crafter.id,
        name: b.crafter.name,
        characterName: b.crafter.characterName,
        active: crafterActive,
      },
    };
  });

  const visibleRows = filters.hideEmpty ? rows.filter((r) => r.remaining > 0 && !r.isWasted) : rows;

  return {
    crafters: crafters.map((c) => ({ id: c.id, name: c.name })),
    rows: visibleRows,
  };
}
