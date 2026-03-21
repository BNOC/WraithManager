export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { CrafterPayCard } from "@/components/CrafterPayCard";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export default async function PaymentsPage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
    include: {
      batches: {
        orderBy: { craftedAt: "asc" },
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

  const grandOwed = crafterStats.reduce((s, c) => s + c.totalOwed, 0);
  const grandPaid = crafterStats.reduce((s, c) => s + c.totalPaid, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Payments</p>
        <h1 className="text-3xl font-bold text-ink">Payments</h1>
        <p className="text-ink-dim mt-1">
          Track what has been paid to each crafter for consumed items
        </p>
      </div>

      {/* Grand summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Owed", value: grandOwed, color: "text-primary" },
          { label: "Total Paid", value: grandPaid, color: "text-green-400" },
          { label: "Outstanding", value: grandOwed - grandPaid, color: grandOwed - grandPaid > 0 ? "text-red-400" : "text-ink-dim" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface border border-rim rounded-2xl px-4 py-3 shadow-lg shadow-black/30">
            <p className="text-ink-faint text-xs mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{formatGold(value)}</p>
          </div>
        ))}
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
