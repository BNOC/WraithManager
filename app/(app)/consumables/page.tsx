export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeIcon } from "@/components/ItemTypeIcon";
import { ConsumablesFilter } from "@/components/ConsumablesFilter";
import type { ItemType } from "@prisma/client";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface PageProps {
  searchParams: Promise<{ crafter?: string; type?: string; hideEmpty?: string }>;
}

export default async function ConsumablesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hideEmpty = params.hideEmpty === "1";

  const crafters = await prisma.crafter.findMany({ orderBy: { name: "asc" } });

  const where: Record<string, unknown> = {};
  if (params.crafter) where.crafterId = params.crafter;
  if (
    params.type &&
    ["FLASK_CAULDRON", "POTION_CAULDRON", "FEAST", "VANTUS_RUNE", "OTHER"].includes(params.type)
  ) {
    where.itemType = params.type as ItemType;
  }

  const batches = await prisma.craftBatch.findMany({
    where,
    orderBy: { craftedAt: "desc" },
    include: {
      crafter: true,
      usageLines: { select: { quantity: true, costPerUnit: true } },
    },
  });

  // Derive per-batch stats
  const rows = batches.map((b) => {
    const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const usedValue = b.usageLines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
    const remaining = b.quantity - usedQty;
    const totalValue = b.quantity * b.costPerUnit;
    const owedAmount = totalValue; // full batch is always owed regardless of usage
    const paymentStatus =
      b.paidAmount >= owedAmount && owedAmount > 0
        ? "paid"
        : b.paidAmount > 0
        ? "partial"
        : "unpaid";
    const crafterActive = (b.crafter as typeof b.crafter & { active: boolean }).active;
    // Tradeable items (VANTUS_RUNE) can be passed to other players — not wasted when crafter leaves
    const isWarbound = b.itemType !== "VANTUS_RUNE";
    const isWasted = !crafterActive && remaining > 0 && isWarbound;
    return { ...b, usedQty, usedValue, remaining, totalValue, owedAmount, paymentStatus, crafterActive, isWarbound, isWasted };
  });

  const visibleRows = hideEmpty ? rows.filter((r) => r.remaining > 0 && !r.isWasted) : rows;
  // Tradeable items (VANTUS_RUNE) are never crafter-locked — always in the active section
  const activeRows = visibleRows.filter((r) => r.crafterActive || !r.isWarbound);
  const inactiveRows = visibleRows.filter((r) => !r.crafterActive && r.isWarbound);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Craft Log</p>
          <h1 className="text-3xl font-bold text-ink">Consumables</h1>
        </div>
        <Link
          href="/consumables/new"
          className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm"
        >
          + Log Craft
        </Link>
      </div>

      {/* Filters */}
      <div className="relative">
        <ConsumablesFilter
          crafters={crafters.map((c) => ({ id: c.id, name: c.name }))}
          activeCrafter={params.crafter ?? ""}
          activeType={params.type ?? ""}
          hideEmpty={hideEmpty}
        />
      </div>

      {/* Table */}
      {visibleRows.length === 0 ? (
        <div className="bg-surface border border-rim rounded-2xl p-12 text-center shadow-lg shadow-black/30">
          <p className="text-ink-dim text-lg">No craft batches found.</p>
          <Link
            href="/consumables/new"
            className="mt-4 inline-block text-primary hover:opacity-80"
          >
            Log your first craft →
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rim bg-surface/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Crafter</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Crafted</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Used</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Left</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Cost/Unit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Owed</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Date</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-rim/50 transition-colors ${row.remaining === 0 ? "opacity-40" : "hover:bg-surface-hi/20"}`}
                >
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        <ItemTypeIcon type={row.itemType} size={16} />
                        <span className="text-ink font-medium">{row.itemName}</span>
                      </div>
                      {row.notes && (
                        <p className="text-ink-dim text-xs">{row.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-dim">
                    {row.crafter.characterName}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">
                    {row.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">
                    {row.usedQty > 0 ? (
                      <span className="text-blue-400">{row.usedQty}</span>
                    ) : (
                      <span className="text-ink-faint">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.remaining > 0 ? (
                      <span className="text-ink">{row.remaining}</span>
                    ) : (
                      <span className="text-ink-faint">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-dim">
                    {formatGold(row.costPerUnit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${row.paymentStatus === "paid" ? "line-through text-ink-faint" : "text-primary"}`}>
                      {formatGold(row.owedAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge
                      paidAmount={row.paidAmount}
                      owedAmount={row.owedAmount}
                      status={row.paymentStatus}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-dim text-xs whitespace-nowrap">
                    {formatDate(row.craftedAt)}
                  </td>
                </tr>
              ))}
              {inactiveRows.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/70 border-y border-amber-400/20"
                      style={{ background: "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(245,158,11,0.06) 6px, rgba(245,158,11,0.06) 12px)" }}
                    >
                      Inactive Crafters
                    </td>
                  </tr>
                  {inactiveRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-rim/50 transition-colors ${
                        row.isWasted
                          ? "bg-red-950/30"
                          : row.remaining === 0
                          ? "opacity-40"
                          : "hover:bg-surface-hi/20"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            <ItemTypeIcon type={row.itemType} size={16} />
                            <span className="text-ink font-medium">{row.itemName}</span>
                          </div>
                          {row.notes && (
                            <p className="text-ink-dim text-xs">{row.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-ink-faint">{row.crafter.characterName}</span>
                        <span className="ml-1.5 text-[10px] text-ink-faint border border-rim rounded px-1 py-px uppercase tracking-wide">inactive</span>
                      </td>
                      <td className="px-4 py-3 text-right text-ink">{row.quantity}</td>
                      <td className="px-4 py-3 text-right text-ink">
                        {row.usedQty > 0 ? (
                          <span className="text-blue-400">{row.usedQty}</span>
                        ) : (
                          <span className="text-ink-faint">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.isWasted ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-red-400/70 line-through">{row.remaining}</span>
                            <span className="text-[10px] text-red-400/60 font-semibold uppercase tracking-wide">Wasted</span>
                          </div>
                        ) : row.remaining > 0 ? (
                          <span className="text-ink">{row.remaining}</span>
                        ) : (
                          <span className="text-ink-faint">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-dim">{formatGold(row.costPerUnit)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${row.paymentStatus === "paid" ? "line-through text-ink-faint" : "text-primary"}`}>
                          {formatGold(row.owedAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <PaymentBadge paidAmount={row.paidAmount} owedAmount={row.owedAmount} status={row.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-ink-dim text-xs whitespace-nowrap">{formatDate(row.craftedAt)}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentBadge({
  paidAmount,
  owedAmount,
  status,
}: {
  paidAmount: number;
  owedAmount: number;
  status: string;
}) {
  if (owedAmount === 0) return <span className="text-ink-faint text-xs">Nothing owed</span>;
  if (status === "paid")
    return (
      <span className="text-xs text-green-400 font-medium">✓ Paid</span>
    );
  if (status === "partial")
    return (
      <span className="text-xs text-amber-400">
        Part-paid ({Math.round((paidAmount / owedAmount) * 100)}%)
      </span>
    );
  return <span className="text-xs text-ink-dim">Unpaid</span>;
}

