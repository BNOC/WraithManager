export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { BatchPayButton } from "@/components/BatchPayButton";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        <h1 className="text-3xl font-bold text-yellow-400">Payments</h1>
        <p className="text-zinc-400 mt-1">
          Track what has been paid to each crafter for consumed items
        </p>
      </div>

      {/* Grand summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Owed", value: grandOwed, color: "text-yellow-400" },
          { label: "Total Paid", value: grandPaid, color: "text-green-400" },
          { label: "Outstanding", value: grandOwed - grandPaid, color: grandOwed - grandPaid > 0 ? "text-red-400" : "text-zinc-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <p className="text-zinc-500 text-xs mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{formatGold(value)}</p>
          </div>
        ))}
      </div>

      {/* Per-crafter sections */}
      {crafterStats.map((crafter) => (
        <div key={crafter.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {/* Crafter header */}
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-zinc-100">{crafter.characterName}</h2>
              <div className="flex gap-3 text-sm">
                <span className="text-zinc-500">
                  Owed:{" "}
                  <span className="text-yellow-400 font-medium">
                    {formatGold(crafter.totalOwed)}
                  </span>
                </span>
                <span className="text-zinc-500">
                  Paid:{" "}
                  <span className="text-green-400 font-medium">
                    {formatGold(crafter.totalPaid)}
                  </span>
                </span>
              </div>
            </div>
            <div
              className={`text-lg font-bold ${
                crafter.balance > 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              {crafter.balance > 0
                ? `${formatGold(crafter.balance)} outstanding`
                : crafter.totalOwed > 0
                ? "✓ Settled"
                : "Nothing owed"}
            </div>
          </div>

          {/* Batch rows */}
          {crafter.batchRows.length === 0 ? (
            <p className="px-4 py-4 text-zinc-600 text-sm">No craft batches.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                  <th className="text-left px-4 py-2 text-zinc-500 font-medium text-xs">Date</th>
                  <th className="text-left px-4 py-2 text-zinc-500 font-medium text-xs">Item</th>
                  <th className="text-right px-4 py-2 text-zinc-500 font-medium text-xs hidden sm:table-cell">Crafted</th>
                  <th className="text-right px-4 py-2 text-zinc-500 font-medium text-xs hidden sm:table-cell">Used</th>
                  <th className="text-right px-4 py-2 text-zinc-500 font-medium text-xs">Owed</th>
                  <th className="text-left px-4 py-2 text-zinc-500 font-medium text-xs">Payment</th>
                </tr>
              </thead>
              <tbody>
                {crafter.batchRows.map((batch) => (
                  <tr key={batch.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/10">
                    <td className="px-4 py-2.5 text-zinc-500 text-xs whitespace-nowrap">
                      {formatDate(batch.craftedAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ItemTypeBadge type={batch.itemType} />
                        <span className="text-zinc-300 text-xs">{batch.itemName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-400 text-xs hidden sm:table-cell">
                      {batch.quantity} × {formatGold(batch.costPerUnit)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-400 text-xs hidden sm:table-cell">
                      {batch.usedQty > 0 ? (
                        <span>
                          {batch.usedQty}/{batch.quantity}
                        </span>
                      ) : (
                        <span className="text-zinc-600">0/{batch.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-yellow-400 font-medium text-xs">
                        {formatGold(batch.owedAmount)}
                      </span>
                      {batch.unusedQty > 0 && (
                        <p className="text-zinc-600 text-xs mt-0.5">
                          {batch.unusedQty} unused
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <BatchPayButton
                        batchId={batch.id}
                        paidAmount={batch.paidAmount}
                        owedAmount={batch.owedAmount}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
