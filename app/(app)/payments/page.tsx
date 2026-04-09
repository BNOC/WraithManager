export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { CrafterPayCard } from "@/components/CrafterPayCard";


export default async function PaymentsPage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
    include: {
      batches: {
        orderBy: { craftedAt: "desc" },
        include: {
          usageLines: { select: { quantity: true, costPerUnit: true } },
        },
      },
    },
  });

  // Per-crafter aggregates
  const crafterStats = crafters.map((crafter) => {
    const batchRows = crafter.batches.map((b) => {
      const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
      const unusedQty = b.quantity - usedQty;
      const usedValue = b.usageLines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
      const owedAmount = b.quantity * b.costPerUnit; // full batch always owed
      return { ...b, usedQty, unusedQty, usedValue, owedAmount };
    });

    const totalOwed = batchRows.reduce((s, b) => s + b.owedAmount, 0);
    const totalPaid = batchRows.reduce((s, b) => s + b.paidAmount, 0);
    const balance = totalOwed - totalPaid;

    return { ...crafter, batchRows, totalOwed, totalPaid, balance };
  });

  const grandTotalPaid = crafterStats.reduce((s, c) => s + c.totalPaid, 0);

  function formatGoldAbbr(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}m`;
    if (n >= 1_000) return `${(n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
    return `${Math.round(n)}g`;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Payments Log</p>
          <h1 className="text-3xl font-bold text-ink">Payments</h1>
        </div>
        <p className="text-ink-dim text-sm shrink-0 pb-1">
          Paid: <span className="text-green-400 font-semibold">{formatGoldAbbr(grandTotalPaid)}</span>
        </p>
      </div>

      {/* Per-crafter sections */}
      {crafterStats.map((crafter) => (
        <CrafterPayCard
          key={crafter.id}
          id={crafter.id}
          characterName={crafter.characterName}
          totalOwed={crafter.totalOwed}
          totalPaid={crafter.totalPaid}
          balance={crafter.balance}
          batchRows={crafter.batchRows}
        />
      ))}
    </div>
  );
}
