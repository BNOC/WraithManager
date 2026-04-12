export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { CraftersClient } from "@/components/CraftersClient";

export default async function CraftersPage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { name: "asc" },
    include: {
      batches: true,
    },
  });

  const crafterStats = crafters.map((crafter) => {
    const totalCraftedValue = crafter.batches.reduce(
      (s, b) => s + b.quantity * b.costPerUnit,
      0
    );
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

  return <CraftersClient crafters={crafterStats} />;
}
