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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Crafters</h1>
        <p className="text-zinc-400 mt-1">Manage the guild&apos;s consumable crafters</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add crafter form */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Add Crafter</h2>
          <form
            action={createCrafter}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4"
          >
            <div>
              <label
                htmlFor="characterName"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Character Name <span className="text-red-400">*</span>
              </label>
              <input
                id="characterName"
                name="characterName"
                type="text"
                required
                placeholder="e.g. BNOC"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Player Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. BNOC"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Add Crafter
            </button>
          </form>
        </div>

        {/* Crafter list */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">
            Current Crafters{" "}
            <span className="text-sm font-normal text-zinc-400">({crafters.length})</span>
          </h2>
          {crafterStats.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <p className="text-zinc-400">No crafters yet. Add one above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crafterStats.map((crafter) => (
                <div
                  key={crafter.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-lg">
                        {crafter.characterName}
                      </h3>
                      <p className="text-zinc-500 text-sm">{crafter.name}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          crafter.totalOwed > 0 ? "text-yellow-400" : "text-green-400"
                        }`}
                      >
                        {formatGold(crafter.totalOwed)}
                      </p>
                      <p className="text-zinc-500 text-xs">outstanding</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-zinc-500">Batches</p>
                      <p className="text-zinc-300 font-medium">{crafter.batchCount}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Crafted Value</p>
                      <p className="text-zinc-300 font-medium">
                        {formatGold(crafter.totalCraftedValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Total Paid</p>
                      <p className="text-zinc-300 font-medium">{formatGold(crafter.totalPaid)}</p>
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
