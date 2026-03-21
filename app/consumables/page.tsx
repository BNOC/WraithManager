import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { RaidDayBadge } from "@/components/RaidDayBadge";
import { MarkUsedButton } from "@/components/MarkUsedButton";
import { UseTracker } from "@/components/UseTracker";
import type { Crafter, ItemStatus, ItemType } from "@prisma/client";

function formatGold(amount: number) {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UsedOnDates({
  uses,
}: {
  uses: { status: string; usedAt: Date | null }[];
}) {
  const usedDates = uses
    .filter((u) => u.status === "USED" && u.usedAt)
    .map((u) => u.usedAt!);

  if (usedDates.length === 0) return <span className="text-zinc-700">—</span>;

  // Group by calendar day
  const byDay = new Map<string, number>();
  for (const d of usedDates) {
    const key = formatDate(d);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-0.5">
      {Array.from(byDay.entries()).map(([date, count]) => (
        <div key={date}>
          {count > 1 && (
            <span className="text-zinc-400 mr-1">({count})</span>
          )}
          {date}
        </div>
      ))}
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{
    crafter?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function ConsumablesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const crafters = await prisma.crafter.findMany({ orderBy: { characterName: "asc" } });

  const where: Record<string, unknown> = {};
  if (params.crafter) where.crafterId = params.crafter;
  if (params.status && ["AVAILABLE", "USED", "WASTED"].includes(params.status)) {
    where.status = params.status as ItemStatus;
  }
  if (
    params.type &&
    ["FLASK_CAULDRON", "POTION_CAULDRON", "FEAST", "VANTUS_RUNE", "OTHER"].includes(params.type)
  ) {
    where.itemType = params.type as ItemType;
  }

  const rawEntries = await prisma.consumableEntry.findMany({
    where,
    include: { crafter: true, uses: { orderBy: { unitIndex: "asc" } } },
  });

  // Sort by most recent usedAt among uses, falling back to craftedAt for unused entries.
  // Fully-used entries (any usedAt present) bubble to the top.
  function latestUsedAt(entry: (typeof rawEntries)[0]): number {
    const dates = entry.uses
      .filter((u) => u.usedAt)
      .map((u) => u.usedAt!.getTime());
    return dates.length > 0 ? Math.max(...dates) : 0;
  }

  const entries = [...rawEntries].sort((a, b) => {
    const aUsed = latestUsedAt(a);
    const bUsed = latestUsedAt(b);
    if (aUsed !== bUsed) return bUsed - aUsed;
    return b.craftedAt.getTime() - a.craftedAt.getTime();
  });

  const totalCost = entries.reduce((sum, e) => sum + e.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Consumables</h1>
          <p className="text-zinc-400 mt-1">
            {entries.length} entries · {formatGold(totalCost)} total
          </p>
        </div>
        <Link
          href="/consumables/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Log New
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <span className="text-zinc-400 text-sm font-medium">Filter:</span>

        {/* Crafter filter */}
        <div className="flex gap-1 flex-wrap">
          <Link
            href={buildFilterUrl(params, "crafter", undefined)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              !params.crafter
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-700"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
            }`}
          >
            All Crafters
          </Link>
          {crafters.map((c: Crafter) => (
            <Link
              key={c.id}
              href={buildFilterUrl(params, "crafter", c.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                params.crafter === c.id
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-700"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {c.characterName}
            </Link>
          ))}
        </div>

        <span className="text-zinc-700">|</span>

        {/* Status filter */}
        <div className="flex gap-1">
          {[
            { value: undefined, label: "All" },
            { value: "AVAILABLE", label: "Available" },
            { value: "USED", label: "Used" },
            { value: "WASTED", label: "Wasted" },
          ].map((opt) => (
            <Link
              key={opt.label}
              href={buildFilterUrl(params, "status", opt.value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                params.status === opt.value ||
                (!params.status && opt.value === undefined)
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-700"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <span className="text-zinc-700">|</span>

        {/* Type filter */}
        <div className="flex gap-1 flex-wrap">
          {[
            { value: undefined, label: "All Types" },
            { value: "FLASK_CAULDRON", label: "Flask Cauldron" },
            { value: "POTION_CAULDRON", label: "Potion Cauldron" },
            { value: "FEAST", label: "Feast" },
            { value: "VANTUS_RUNE", label: "Vantus Rune" },
            { value: "OTHER", label: "Other" },
          ].map((opt) => (
            <Link
              key={opt.label}
              href={buildFilterUrl(params, "type", opt.value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                params.type === opt.value ||
                (!params.type && opt.value === undefined)
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-700"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 text-lg">No entries found.</p>
          <Link
            href="/consumables/new"
            className="mt-4 inline-block text-yellow-400 hover:text-yellow-300"
          >
            Log your first consumable →
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  Item
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">
                  Crafter
                </th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                  Qty
                </th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                  Cost/Unit
                </th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                  Uses
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">
                  Used On
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-100 font-medium">
                          {entry.itemName}
                        </span>
                        <ItemTypeBadge type={entry.itemType} />
                      </div>
                      {entry.raidDate && (
                        <RaidDayBadge date={entry.raidDate} />
                      )}
                      {entry.notes && (
                        <p className="text-zinc-500 text-xs">{entry.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {entry.crafter.characterName}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 hidden sm:table-cell">
                    {entry.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400 hidden sm:table-cell">
                    {formatGold(entry.costPerUnit)}
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-400 font-medium">
                    {formatGold(entry.totalCost)}
                  </td>
                  <td className="px-4 py-3">
                    {entry.uses.length > 0 ? (
                      <UseTracker uses={entry.uses} />
                    ) : (
                      <MarkUsedButton id={entry.id} currentStatus={entry.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">
                    <UsedOnDates uses={entry.uses} />
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function buildFilterUrl(
  current: Record<string, string | undefined>,
  key: string,
  value: string | undefined
): string {
  const params = new URLSearchParams();
  const keys = ["crafter", "status", "type"];
  for (const k of keys) {
    const v = k === key ? value : current[k];
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return `/consumables${qs ? `?${qs}` : ""}`;
}
