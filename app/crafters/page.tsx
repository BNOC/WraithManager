export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { CraftersClient } from "@/components/CraftersClient";

export default async function CraftersPage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { name: "asc" },
    include: {
      batches: {
        include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
      },
    },
  });

  const crafterStats = crafters.map((crafter) => {
    const totalCraftedValue = crafter.batches.reduce(
      (s, b) => s + b.quantity * b.costPerUnit,
      0
    );
    const totalOwed = crafter.batches.reduce((s, b) => {
      const usedValue = b.usageLines.reduce((ls, l) => ls + l.quantity * l.costPerUnit, 0);
      return s + usedValue - b.paidAmount;
    }, 0);
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    return {
      id: crafter.id,
      name: crafter.name,
      active: (crafter as typeof crafter & { active: boolean }).active,
      batchCount: crafter.batches.length,
      totalCraftedValue,
      totalOwed: Math.max(0, totalOwed),
      totalPaid,
    };
  });

  return <CraftersClient crafters={crafterStats} />;
}
