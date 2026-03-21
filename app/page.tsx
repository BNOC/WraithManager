export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { RaidDayBadge } from "@/components/RaidDayBadge";

async function getDashboardData() {
  const crafters = await prisma.crafter.findMany({
    include: {
      entries: true,
      payments: true,
    },
  });

  const recentEntries = await prisma.consumableEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { crafter: true },
  });

  const stats = {
    totalEntries: await prisma.consumableEntry.count(),
    availableEntries: await prisma.consumableEntry.count({
      where: { status: "AVAILABLE" },
    }),
    usedEntries: await prisma.consumableEntry.count({
      where: { status: "USED" },
    }),
  };

  return { crafters, recentEntries, stats };
}

function formatGold(amount: number) {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export default async function DashboardPage() {
  const { crafters, recentEntries, stats } = await getDashboardData();

  const crafterSummaries = crafters.map((crafter) => {
    const totalCrafted = crafter.entries.reduce(
      (sum, e) => sum + e.totalCost,
      0
    );
    const availableCost = crafter.entries
      .filter((e) => e.status === "AVAILABLE")
      .reduce((sum, e) => sum + e.totalCost, 0);
    const totalPaid = crafter.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOwed = Math.max(0, availableCost - totalPaid);

    return {
      ...crafter,
      totalCrafted,
      availableCost,
      totalPaid,
      totalOwed,
    };
  });

  const totalOwedAll = crafterSummaries.reduce(
    (sum, c) => sum + c.totalOwed,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Guild consumables overview — Raids: Wed, Thu, Mon
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Total Owed</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {formatGold(totalOwedAll)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Total Entries</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">
            {stats.totalEntries}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Available</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {stats.availableEntries}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Used</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {stats.usedEntries}
          </p>
        </div>
      </div>

      {/* Crafter summaries */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Crafter Balances
        </h2>
        {crafterSummaries.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No crafters yet.</p>
            <Link
              href="/crafters"
              className="mt-3 inline-block text-yellow-400 hover:text-yellow-300 text-sm"
            >
              Add crafters →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {crafterSummaries.map((crafter) => (
              <div
                key={crafter.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-zinc-100">
                      {crafter.characterName}
                    </p>
                    <p className="text-zinc-500 text-sm">{crafter.name}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        crafter.totalOwed > 0
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {formatGold(crafter.totalOwed)}
                    </p>
                    <p className="text-zinc-500 text-xs">owed</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-zinc-500">Crafted</p>
                    <p className="text-zinc-300">
                      {formatGold(crafter.totalCrafted)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Paid</p>
                    <p className="text-zinc-300">
                      {formatGold(crafter.totalPaid)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Recent Entries
          </h2>
          <Link
            href="/consumables"
            className="text-yellow-400 hover:text-yellow-300 text-sm"
          >
            View all →
          </Link>
        </div>
        {recentEntries.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No entries yet.</p>
            <Link
              href="/consumables/new"
              className="mt-3 inline-block text-yellow-400 hover:text-yellow-300 text-sm"
            >
              Log consumables →
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                    Item
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                    Crafter
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                    Qty
                  </th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium">
                    Cost
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-100">{entry.itemName}</span>
                        <ItemTypeBadge type={entry.itemType} />
                        <RaidDayBadge date={entry.raidDate} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">
                      {entry.crafter.characterName}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">
                      {entry.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-medium">
                      {formatGold(entry.totalCost)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/consumables/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Log Consumables
        </Link>
        <Link
          href="/payments"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-4 py-2 rounded-lg transition-colors text-sm border border-zinc-700"
        >
          + Log Payment
        </Link>
      </div>
    </div>
  );
}
