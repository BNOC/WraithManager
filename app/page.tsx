export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { RaidDayBadge } from "@/components/RaidDayBadge";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const [crafters, recentBatches, recentUsage, batchCount, usageCount, allBatches] = await Promise.all([
    prisma.crafter.findMany({
      include: {
        batches: {
          include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
        },
      },
    }),
    prisma.craftBatch.findMany({
      orderBy: { craftedAt: "desc" },
      take: 6,
      include: { crafter: true },
    }),
    prisma.usageLog.findMany({
      orderBy: { raidDate: "desc" },
      take: 5,
      include: { lines: { include: { batch: { include: { crafter: true } } } } },
    }),
    prisma.craftBatch.count(),
    prisma.usageLog.count(),
    prisma.craftBatch.findMany({
      include: { usageLines: { select: { quantity: true } } },
    }),
  ]);

  // Inventory: group by itemType + itemName, sum remaining
  const inventoryMap = new Map<string, { itemType: string; itemName: string; remaining: number; total: number }>();
  for (const b of allBatches) {
    const key = `${b.itemType}::${b.itemName}`;
    const used = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const remaining = b.quantity - used;
    if (!inventoryMap.has(key)) {
      inventoryMap.set(key, { itemType: b.itemType, itemName: b.itemName, remaining: 0, total: 0 });
    }
    const entry = inventoryMap.get(key)!;
    entry.remaining += remaining;
    entry.total += b.quantity;
  }
  // Sort by a fixed type order then name
  const TYPE_ORDER: Record<string, number> = {
    FLASK_CAULDRON: 0, POTION_CAULDRON: 1, FEAST: 2, VANTUS_RUNE: 3, OTHER: 4,
  };
  const inventory = [...inventoryMap.values()].sort(
    (a, b) => (TYPE_ORDER[a.itemType] ?? 9) - (TYPE_ORDER[b.itemType] ?? 9) || a.itemName.localeCompare(b.itemName)
  );

  const crafterSummaries = crafters.map((crafter) => {
    const totalOwed = Math.max(
      0,
      crafter.batches.reduce((s, b) => {
        const usedValue = b.usageLines.reduce((ls, l) => ls + l.quantity * l.costPerUnit, 0);
        return s + usedValue - b.paidAmount;
      }, 0)
    );
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    return { ...crafter, totalOwed, totalPaid };
  });

  const grandOwed = crafterSummaries.reduce((s, c) => s + c.totalOwed, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Guild consumables overview — Raids: Wed, Thu, Mon</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Total Outstanding</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{formatGold(grandOwed)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Craft Batches</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{batchCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Usage Sessions</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{usageCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Crafters</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{crafters.length}</p>
        </div>
      </div>

      {/* Current inventory */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Current Inventory</h2>
        {inventory.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-500 text-sm">No craft batches logged yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {inventory.map((item) => {
              const pct = item.total > 0 ? item.remaining / item.total : 0;
              const color =
                item.remaining === 0
                  ? "text-red-400"
                  : pct <= 0.25
                  ? "text-amber-400"
                  : "text-green-400";
              const border =
                item.remaining === 0
                  ? "border-red-900/50"
                  : pct <= 0.25
                  ? "border-amber-900/50"
                  : "border-zinc-800";
              return (
                <div
                  key={`${item.itemType}::${item.itemName}`}
                  className={`bg-zinc-900 border ${border} rounded-lg p-4`}
                >
                  <ItemTypeBadge type={item.itemType as Parameters<typeof ItemTypeBadge>[0]["type"]} />
                  {item.itemName && (
                    <p className="text-zinc-400 text-xs mt-1 truncate">{item.itemName}</p>
                  )}
                  <p className={`text-2xl font-bold mt-2 ${color}`}>{item.remaining}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">of {item.total} crafted</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crafter balances */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Crafter Balances</h2>
        {crafterSummaries.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No crafters yet.</p>
            <Link href="/crafters" className="mt-3 inline-block text-yellow-400 hover:text-yellow-300 text-sm">
              Add crafters →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {crafterSummaries.map((c) => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-zinc-100">{c.characterName}</p>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${c.totalOwed > 0 ? "text-yellow-400" : "text-green-400"}`}>
                      {formatGold(c.totalOwed)}
                    </p>
                    <p className="text-zinc-500 text-xs">outstanding</p>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs mt-2">Paid: {formatGold(c.totalPaid)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent craft batches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-zinc-100">Recent Crafts</h2>
          <Link href="/consumables" className="text-yellow-400 hover:text-yellow-300 text-sm">
            View all →
          </Link>
        </div>
        {recentBatches.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No craft batches yet.</p>
            <Link href="/consumables/new" className="mt-3 inline-block text-yellow-400 hover:text-yellow-300 text-sm">
              Log a craft →
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Item</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">Crafter</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium">Value</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((b) => (
                  <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-100">{b.itemName}</span>
                        <ItemTypeBadge type={b.itemType} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">{b.crafter.characterName}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{b.quantity}</td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-medium">
                      {formatGold(b.quantity * b.costPerUnit)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell">
                      <RaidDayBadge date={b.craftedAt} />
                      <span className="ml-1">{formatDate(b.craftedAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent usage */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-zinc-100">Recent Usage</h2>
          <Link href="/usage" className="text-yellow-400 hover:text-yellow-300 text-sm">
            View all →
          </Link>
        </div>
        {recentUsage.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No usage logged yet.</p>
            <Link href="/usage/new" className="mt-3 inline-block text-yellow-400 hover:text-yellow-300 text-sm">
              Log raid night usage →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentUsage.map((log) => {
              const value = log.lines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
              return (
                <div key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <RaidDayBadge date={log.raidDate} />
                    <span className="text-zinc-300 text-sm">{formatDate(log.raidDate)}</span>
                    <ItemTypeBadge type={log.itemType} />
                    {log.itemName && <span className="text-zinc-400 text-sm">{log.itemName}</span>}
                    <span className="text-zinc-500 text-sm">×{log.quantityUsed}</span>
                  </div>
                  <span className="text-yellow-400 font-medium text-sm">{value > 0 ? formatGold(value) : "—"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/consumables/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Log Craft
        </Link>
        <Link
          href="/usage/new"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-4 py-2 rounded-lg transition-colors text-sm border border-zinc-700"
        >
          + Log Usage
        </Link>
      </div>
    </div>
  );
}
