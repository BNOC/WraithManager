// lib/queries/payments.ts
import prisma from "@/lib/prisma";

export interface PaymentBatchRow {
  id: string;
  itemType: string;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  paidAmount: number;
  craftedAt: Date;
  usedQty: number;
  unusedQty: number;
  usedValue: number;
  owedAmount: number;
}

export interface CrafterPaymentStat {
  id: string;
  name: string;
  characterName: string;
  active: boolean;
  batchRows: PaymentBatchRow[];
  totalOwed: number;
  totalPaid: number;
  balance: number;
}

export interface PaymentsData {
  crafterStats: CrafterPaymentStat[];
  grandTotalPaid: number;
}

export async function getPaymentsData(): Promise<PaymentsData> {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
    include: {
      batches: {
        orderBy: { craftedAt: "desc" },
        include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
      },
    },
  });

  const crafterStats: CrafterPaymentStat[] = crafters.map((crafter) => {
    const batchRows: PaymentBatchRow[] = crafter.batches.map((b) => {
      const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
      const unusedQty = b.quantity - usedQty;
      const usedValue = b.usageLines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
      const owedAmount = b.quantity * b.costPerUnit;
      return { id: b.id, itemType: b.itemType, itemName: b.itemName, quantity: b.quantity, costPerUnit: b.costPerUnit, paidAmount: b.paidAmount, craftedAt: b.craftedAt, usedQty, unusedQty, usedValue, owedAmount };
    });
    const totalOwed = batchRows.reduce((s, b) => s + b.owedAmount, 0);
    const totalPaid = batchRows.reduce((s, b) => s + b.paidAmount, 0);
    const balance = totalOwed - totalPaid;
    return {
      id: crafter.id,
      name: crafter.name,
      characterName: crafter.characterName,
      active: (crafter as typeof crafter & { active: boolean }).active,
      batchRows,
      totalOwed,
      totalPaid,
      balance,
    };
  });

  const grandTotalPaid = crafterStats.reduce((s, c) => s + c.totalPaid, 0);
  return { crafterStats, grandTotalPaid };
}
