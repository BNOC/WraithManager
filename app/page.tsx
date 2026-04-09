export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { ItemTypeIcon } from "@/components/ItemTypeIcon";
import { RaidDayBadge } from "@/components/RaidDayBadge";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatGoldAbbr(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}g`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const [crafters, recentBatches, recentUsage, allBatches] = await Promise.all([
    prisma.crafter.findMany({
      include: {
        batches: {
          include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
        },
      },
    }),
    prisma.craftBatch.findMany({
      orderBy: { craftedAt: "desc" },
      take: 5,
      include: { crafter: true },
    }),
    prisma.usageLog.findMany({
      orderBy: { raidDate: "desc" },
      take: 5,
      include: { lines: { include: { batch: { include: { crafter: true } } } } },
    }),
    prisma.craftBatch.findMany({
      include: { usageLines: { select: { quantity: true } } },
    }),
  ]);

  const crafterSummaries = crafters.map((crafter) => {
    const totalOwed = crafter.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0);
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    const outstanding = Math.max(0, totalOwed - totalPaid);
    return { ...crafter, totalOwed, totalPaid, outstanding };
  });

  const activeSummaries = crafterSummaries.filter((c) => (c as typeof c & { active: boolean }).active);
  const grandOutstanding = activeSummaries.reduce((s, c) => s + c.outstanding, 0);
  const grandTotalPaid = activeSummaries.reduce((s, c) => s + c.totalPaid, 0);
  const grandTotalCost = allBatches.reduce((s: number, b: { costPerUnit: number; usageLines: { quantity: number }[] }) => {
    const used = b.usageLines.reduce((u: number, l: { quantity: number }) => u + l.quantity, 0);
    return s + used * b.costPerUnit;
  }, 0);

  // Inventory
  const inventoryMap = new Map<string, { itemType: string; itemName: string; remaining: number; total: number; remainingValue: number }>();
  for (const b of allBatches) {
    const key = `${b.itemType}::${b.itemName}`;
    const used = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    if (!inventoryMap.has(key)) inventoryMap.set(key, { itemType: b.itemType, itemName: b.itemName, remaining: 0, total: 0, remainingValue: 0 });
    const entry = inventoryMap.get(key)!;
    entry.remaining += b.quantity - used;
    entry.total += b.quantity;
    entry.remainingValue += (b.quantity - used) * b.costPerUnit;
  }
  const TYPE_ORDER: Record<string, number> = { FLASK_CAULDRON: 0, POTION_CAULDRON: 1, FEAST: 2, VANTUS_RUNE: 3, OTHER: 4 };

  // Always show these types even with no batches (feast handled separately)
  const PINNED: { type: string; name: string }[] = [
    { type: "FLASK_CAULDRON", name: "Flask Cauldron" },
    { type: "POTION_CAULDRON", name: "Potion Cauldron" },
    { type: "VANTUS_RUNE", name: "Vantus Rune" },
  ];
  for (const { type, name } of PINNED) {
    const key = `${type}::${name}`;
    if (!inventoryMap.has(key)) {
      inventoryMap.set(key, { itemType: type, itemName: name, remaining: 0, total: 0, remainingValue: 0 });
    }
  }

  const inventory = [...inventoryMap.values()].sort(
    (a, b) => (TYPE_ORDER[a.itemType] ?? 9) - (TYPE_ORDER[b.itemType] ?? 9) || a.itemName.localeCompare(b.itemName)
  );
  const totalInventoryValue = inventory.reduce((s, i) => s + i.remainingValue, 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/consumables/new"
            className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm"
          >
            + Log Craft
          </Link>
          <Link
            href="/usage/new"
            className="bg-surface border border-rim hover:border-primary/40 text-ink font-medium px-4 py-2 rounded-xl transition-colors text-sm"
          >
            + Log Raid Night
          </Link>
        </div>
      </div>

      {/* Stat card */}
      <div className="relative bg-surface border border-rim rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
        {/* Subtle gradient top shimmer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="grid grid-cols-4 divide-x divide-rim">
          {[
            { label: "Outstanding", shortLabel: "Owed", value: formatGold(grandOutstanding), abbr: formatGoldAbbr(grandOutstanding), accent: true },
            { label: "Total Paid", shortLabel: "Paid", value: formatGold(grandTotalPaid), abbr: formatGoldAbbr(grandTotalPaid), accent: false },
            { label: "Inventory Value", shortLabel: "Inv.", value: formatGold(totalInventoryValue), abbr: formatGoldAbbr(totalInventoryValue), accent: false },
            { label: "Total Spent", shortLabel: "Spent", value: formatGold(grandTotalCost), abbr: formatGoldAbbr(grandTotalCost), accent: false },
          ].map(({ label, shortLabel, value, abbr, accent }) => (
            <div key={label} className={`relative px-4 sm:px-7 py-4 sm:py-6 ${accent ? "bg-primary/[0.05]" : ""}`}>
              {accent && <div className="absolute top-0 inset-x-0 h-0.5 bg-primary/50" />}
              <p className="text-ink-faint text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest">
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </p>
              <p className={`font-bold mt-1.5 sm:mt-3 leading-none ${accent ? "text-primary text-xl sm:text-3xl" : "text-ink text-lg sm:text-2xl"}`}>
                <span className="sm:hidden">{abbr}</span>
                <span className="hidden sm:inline">{value}</span>
              </p>
              {accent && (
                <div className="hidden sm:flex items-center gap-1 mt-3">
                  <div className="h-0.5 w-8 bg-primary/50 rounded-full" />
                  <div className="h-0.5 w-3 bg-primary/25 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inventory */}
      {(() => {
        const FEAST_SUBTYPES = ["Primary Stat", "Secondary Stat"];
        const feastItems = inventory.filter((i) => i.itemType === "FEAST");
        const feastByName = new Map(feastItems.map((f) => [f.itemName, f]));
        const feastRows = FEAST_SUBTYPES.map((name) => feastByName.get(name) ?? { itemType: "FEAST", itemName: name, remaining: 0, total: 0, remainingValue: 0 });
        const nonFeastItems = inventory.filter((i) => i.itemType !== "FEAST");
        const feastTotal = feastItems.reduce((s, i) => s + i.remaining, 0);
        const feastCraftedTotal = feastItems.reduce((s, i) => s + i.total, 0);

        const allInventoryItems = [
          ...nonFeastItems.map((item) => ({ ...item, isFeast: false })),
          { itemType: "FEAST", itemName: "Feast", remaining: feastTotal, total: feastCraftedTotal, remainingValue: 0, isFeast: true },
        ];

        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-3">Current Inventory</h2>
            {/* Mobile: stacked rows */}
            <div className="sm:hidden bg-surface border border-rim rounded-2xl shadow-lg shadow-black/30 overflow-hidden divide-y divide-rim">
              {allInventoryItems.map((item) => {
                const pct = item.total > 0 ? item.remaining / item.total : 0;
                const numColor =
                  item.total === 0 ? "text-red-400"
                  : item.remaining === 0 ? "text-red-400"
                  : pct <= 0.25 ? "text-amber-400"
                  : "text-emerald-400";
                const type = item.itemType as Parameters<typeof ItemTypeIcon>[0]["type"];
                return (
                  <div key={`${item.itemType}::${item.itemName}`} className="flex items-center gap-3 px-4 py-3">
                    <ItemTypeIcon type={type} size={18} />
                    <div className="flex-1 min-w-0">
                      <ItemTypeBadge type={type} />
                      {item.isFeast && feastCraftedTotal > 0 && (
                        <div className="flex gap-3 mt-0.5">
                          {feastRows.map((f) => (
                            <p key={f.itemName} className="text-ink-faint text-xs">
                              {f.itemName.split(" ")[0]}:{" "}
                              <span className="text-ink-dim font-medium">{f.total === 0 ? "—" : f.remaining}</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {!item.isFeast && item.itemType === "OTHER" && item.itemName && (
                        <p className="text-ink-faint text-xs mt-0.5 truncate">{item.itemName}</p>
                      )}
                    </div>
                    <p className={`text-2xl font-bold shrink-0 ${numColor}`}>
                      {item.total === 0 ? "—" : item.remaining}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop: horizontal columns */}
            <div className="hidden sm:block bg-surface border border-rim rounded-2xl shadow-lg shadow-black/30 overflow-hidden">
              <div className="grid divide-x divide-rim" style={{ gridTemplateColumns: `repeat(${allInventoryItems.length}, 1fr)` }}>
                {allInventoryItems.map((item) => {
                  const pct = item.total > 0 ? item.remaining / item.total : 0;
                  const numColor =
                    item.total === 0 ? "text-red-400"
                    : item.remaining === 0 ? "text-red-400"
                    : pct <= 0.25 ? "text-amber-400"
                    : "text-emerald-400";
                  const type = item.itemType as Parameters<typeof ItemTypeIcon>[0]["type"];
                  return (
                    <div key={`${item.itemType}::${item.itemName}`} className="flex items-center gap-2 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <ItemTypeIcon type={type} size={14} />
                          <ItemTypeBadge type={type} small />
                        </div>
                        {!item.isFeast && item.itemType === "OTHER" && item.itemName && (
                          <p className="text-ink-faint text-[10px] mt-0.5 truncate">{item.itemName}</p>
                        )}
                        {item.isFeast && feastCraftedTotal > 0 && (
                          <div className="flex gap-2 mt-0.5">
                            {feastRows.map((f) => (
                              <p key={f.itemName} className="text-ink-faint text-[10px] leading-tight">
                                {f.itemName.split(" ")[0]}:{" "}
                                <span className="text-ink-dim">{f.total === 0 ? "—" : f.remaining}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className={`text-2xl font-bold shrink-0 ${numColor}`}>
                        {item.total === 0 ? "—" : item.remaining}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crafter balances */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-3">Crafter Balances</h2>
          {crafterSummaries.length === 0 ? (
            <div className="bg-surface border border-rim rounded-2xl p-8 text-center">
              <p className="text-ink-dim text-sm">No crafters yet.</p>
              <Link href="/crafters" className="mt-2 inline-block text-primary hover:opacity-80 text-sm">
                Add crafters →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSummaries.map((c) => (
                <div key={c.id} className="bg-surface border border-rim rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg shadow-black/20">
                  <p className="font-semibold text-ink">{c.characterName}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+{formatGold(c.totalPaid)}</p>
                      <p className="text-ink-faint text-xs">paid</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${c.outstanding > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {formatGold(c.outstanding)}
                      </p>
                      <p className="text-ink-faint text-xs">outstanding</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent usage */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Recent Usage</h2>
            <Link href="/usage" className="text-primary hover:opacity-80 text-xs transition-opacity">View all →</Link>
          </div>
          {recentUsage.length === 0 ? (
            <div className="bg-surface border border-rim rounded-2xl p-8 text-center">
              <p className="text-ink-dim text-sm">No usage logged yet.</p>
              <Link href="/usage/new" className="mt-2 inline-block text-primary hover:opacity-80 text-sm">
                Log raid night →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentUsage.map((log) => {
                const value = log.lines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
                const crafterName = log.lines[0]?.batch.crafter.name;
                return (
                  <div key={log.id} className="bg-surface border border-rim rounded-2xl px-4 py-3 shadow-lg shadow-black/20">
                    {/* Row 1: date + pill + value */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <RaidDayBadge date={log.raidDate} />
                          <span className="text-ink-faint text-xs">{formatDate(log.raidDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ItemTypeIcon type={log.itemType} size={16} />
                          <ItemTypeBadge type={log.itemType} small />
                        </div>
                        {/* Desktop only: name + qty inline */}
                        {log.itemName && <span className="hidden sm:inline text-ink-dim text-xs truncate">{log.itemName}</span>}
                        <span className="hidden sm:inline text-ink font-bold text-sm shrink-0">×{log.quantityUsed}</span>
                      </div>
                      <span className="text-primary font-medium text-sm shrink-0">{value > 0 ? formatGold(value) : "—"}</span>
                    </div>
                    {/* Row 2: mobile only — name · qty · crafter */}
                    <div className="sm:hidden flex items-center gap-2 mt-1.5 text-xs text-ink-dim">
                      {log.itemName && <span>{log.itemName}</span>}
                      <span className="text-ink font-bold">×{log.quantityUsed}</span>
                      {crafterName && <span className="text-ink-faint">{crafterName}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent crafts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Recent Crafts</h2>
          <Link href="/consumables" className="text-primary hover:opacity-80 text-xs transition-opacity">View all →</Link>
        </div>
        {recentBatches.length === 0 ? (
          <div className="bg-surface border border-rim rounded-2xl p-8 text-center">
            <p className="text-ink-dim text-sm">No craft batches yet.</p>
            <Link href="/consumables/new" className="mt-2 inline-block text-primary hover:opacity-80 text-sm">
              Log a craft →
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rim">
                  <th className="text-left px-5 py-3 text-ink-faint text-xs font-semibold uppercase tracking-wider">Item</th>
                  <th className="text-left px-5 py-3 text-ink-faint text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Crafter</th>
                  <th className="text-right px-5 py-3 text-ink-faint text-xs font-semibold uppercase tracking-wider">Qty</th>
                  <th className="text-right px-5 py-3 text-ink-faint text-xs font-semibold uppercase tracking-wider">Value</th>
                  <th className="text-left px-5 py-3 text-ink-faint text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rim/50">
                {recentBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-hi/50 transition-colors">
                    <td className="px-5 py-3.5">
                      {/* Desktop: all inline */}
                      <div className="hidden sm:flex items-center gap-2">
                        <ItemTypeIcon type={b.itemType} size={16} />
                        <span className="text-ink font-medium">{b.itemName}</span>
                        <ItemTypeBadge type={b.itemType} />
                      </div>
                      {/* Mobile: icon + name on row 1, pill on row 2 */}
                      <div className="sm:hidden">
                        <div className="flex items-center gap-2">
                          <ItemTypeIcon type={b.itemType} size={16} />
                          <span className="text-ink font-medium">{b.itemName}</span>
                        </div>
                        <div className="mt-1">
                          <ItemTypeBadge type={b.itemType} small />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-dim hidden sm:table-cell">{b.crafter.characterName}</td>
                    <td className="px-5 py-3.5 text-right text-ink">{b.quantity}</td>
                    <td className="px-5 py-3.5 text-right text-primary font-medium">{formatGold(b.quantity * b.costPerUnit)}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <RaidDayBadge date={b.craftedAt} />
                        <span className="text-ink-dim text-xs">{formatDate(b.craftedAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
