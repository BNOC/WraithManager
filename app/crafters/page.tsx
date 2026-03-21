export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { createCrafter } from "@/lib/actions";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export default async function CraftersPage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
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
    return { ...crafter, totalCraftedValue, totalOwed: Math.max(0, totalOwed), totalPaid, batchCount: crafter.batches.length };
  });

  const inputClass =
    "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Crafters</p>
        <h1 className="text-3xl font-bold text-ink">Crafters</h1>
        <p className="text-ink-dim mt-1">Manage the guild&apos;s consumable crafters</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add crafter form */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-4">Add Crafter</p>
          <form
            action={createCrafter}
            className="bg-surface border border-rim rounded-2xl p-5 space-y-4 shadow-lg shadow-black/30"
          >
            <div>
              <label
                htmlFor="characterName"
                className={labelClass}
              >
                Character Name <span className="text-red-400">*</span>
              </label>
              <input
                id="characterName"
                name="characterName"
                type="text"
                required
                placeholder="e.g. BNOC"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className={labelClass}
              >
                Player Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. BNOC"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity w-full"
            >
              Add Crafter
            </button>
          </form>
        </div>

        {/* Crafter list */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-4">
            Current Crafters{" "}
            <span className="text-ink-dim font-normal normal-case tracking-normal">({crafters.length})</span>
          </p>
          {crafterStats.length === 0 ? (
            <div className="bg-surface border border-rim rounded-2xl p-8 text-center shadow-lg shadow-black/30">
              <p className="text-ink-dim">No crafters yet. Add one above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crafterStats.map((crafter) => (
                <div
                  key={crafter.id}
                  className="bg-surface border border-rim rounded-2xl p-5 shadow-lg shadow-black/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-ink text-lg">
                        {crafter.characterName}
                      </h3>
                      <p className="text-ink-dim text-sm">{crafter.name}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          crafter.totalOwed > 0 ? "text-primary" : "text-green-400"
                        }`}
                      >
                        {formatGold(crafter.totalOwed)}
                      </p>
                      <p className="text-ink-dim text-xs">outstanding</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-rim grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-ink-dim">Batches</p>
                      <p className="text-ink font-medium">{crafter.batchCount}</p>
                    </div>
                    <div>
                      <p className="text-ink-dim">Crafted Value</p>
                      <p className="text-ink font-medium">
                        {formatGold(crafter.totalCraftedValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-dim">Total Paid</p>
                      <p className="text-ink font-medium">{formatGold(crafter.totalPaid)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
