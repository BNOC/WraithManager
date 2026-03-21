export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { RaidDayBadge } from "@/components/RaidDayBadge";
import type { ItemType } from "@prisma/client";

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

interface PageProps {
  searchParams: Promise<{ crafter?: string; type?: string }>;
}

export default async function ConsumablesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const crafters = await prisma.crafter.findMany({ orderBy: { characterName: "asc" } });

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
    return { ...b, usedQty, usedValue, remaining, totalValue, owedAmount, paymentStatus };
  });

  const totalValue = rows.reduce((s, r) => s + r.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Craft Log</h1>
          <p className="text-zinc-400 mt-1">
            {rows.length} batches · {formatGold(totalValue)} total value crafted
          </p>
        </div>
        <Link
          href="/consumables/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Log Craft
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <span className="text-zinc-400 text-sm font-medium">Filter:</span>

        <div className="flex gap-1 flex-wrap">
          <Link
            href={buildUrl(params, "crafter", undefined)}
            className={filterClass(!params.crafter)}
          >
            All Crafters
          </Link>
          {crafters.map((c) => (
            <Link
              key={c.id}
              href={buildUrl(params, "crafter", c.id)}
              className={filterClass(params.crafter === c.id)}
            >
              {c.characterName}
            </Link>
          ))}
        </div>

        <span className="text-zinc-700">|</span>

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
              href={buildUrl(params, "type", opt.value)}
              className={filterClass(params.type === opt.value || (!params.type && !opt.value))}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 text-lg">No craft batches found.</p>
          <Link
            href="/consumables/new"
            className="mt-4 inline-block text-yellow-400 hover:text-yellow-300"
          >
            Log your first craft →
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Item</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Crafter</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">Crafted</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">Used</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">Left</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Cost/Unit</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Owed</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Payment</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-100 font-medium">{row.itemName}</span>
                        <ItemTypeBadge type={row.itemType} />
                      </div>
                      {row.notes && (
                        <p className="text-zinc-500 text-xs">{row.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {row.crafter.characterName}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 hidden sm:table-cell">
                    {row.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 hidden sm:table-cell">
                    {row.usedQty > 0 ? (
                      <span className="text-blue-400">{row.usedQty}</span>
                    ) : (
                      <span className="text-zinc-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    {row.remaining > 0 ? (
                      <span className="text-zinc-300">{row.remaining}</span>
                    ) : (
                      <span className="text-zinc-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {formatGold(row.costPerUnit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-yellow-400 font-medium">
                      {formatGold(row.owedAmount)}
                    </span>
                    {row.remaining > 0 && (
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {row.remaining} unused
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <PaymentBadge
                      paidAmount={row.paidAmount}
                      owedAmount={row.owedAmount}
                      status={row.paymentStatus}
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">
                    <RaidDayBadge date={row.craftedAt} />
                    <div className="mt-0.5">{formatDate(row.craftedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  if (owedAmount === 0) return <span className="text-zinc-600 text-xs">Nothing owed</span>;
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
  return <span className="text-xs text-zinc-500">Unpaid</span>;
}

function filterClass(active: boolean) {
  return `px-2 py-1 rounded text-xs font-medium transition-colors ${
    active
      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-700"
      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
  }`;
}

function buildUrl(
  current: Record<string, string | undefined>,
  key: string,
  value: string | undefined
): string {
  const p = new URLSearchParams();
  for (const k of ["crafter", "type"]) {
    const v = k === key ? value : current[k];
    if (v) p.set(k, v);
  }
  const qs = p.toString();
  return `/consumables${qs ? `?${qs}` : ""}`;
}
