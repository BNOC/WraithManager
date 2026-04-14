export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeIcon } from "@/components/ui/ItemTypeIcon";
import { ItemTypeBadge } from "@/components/ui/ItemTypeBadge";
import { BatchPayButton } from "@/components/BatchPayButton";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CrafterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const crafter = await prisma.crafter.findUnique({
    where: { id },
    include: {
      batches: {
        orderBy: { craftedAt: "desc" },
        include: {
          usageLines: { select: { quantity: true, costPerUnit: true } },
        },
      },
    },
  });

  if (!crafter) notFound();

  const batches = crafter.batches.map((b) => {
    const totalValue = b.quantity * b.costPerUnit;
    const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const unusedQty = b.quantity - usedQty;
    const outstanding = Math.max(0, totalValue - b.paidAmount);
    const isFullyPaid = b.paidAmount >= totalValue;
    const isPartial = !isFullyPaid && b.paidAmount > 0;
    return { ...b, totalValue, usedQty, unusedQty, outstanding, isFullyPaid, isPartial };
  });

  const totalOwed = batches.reduce((s, b) => s + b.totalValue, 0);
  const totalPaid = batches.reduce((s, b) => s + b.paidAmount, 0);
  const grandOutstanding = Math.max(0, totalOwed - totalPaid);
  const pct = totalOwed > 0 ? Math.min(100, (totalPaid / totalOwed) * 100) : 100;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Back nav */}
      <Link
        href="/crafters"
        className="inline-flex items-center gap-1.5 text-ink-faint hover:text-ink-dim text-sm transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Crafters
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Crafter</p>
          <h1 className="text-3xl font-bold text-ink">{crafter.characterName}</h1>
          {!crafter.active && (
            <span className="inline-block mt-1 text-xs text-ink-faint font-medium uppercase tracking-wider">Inactive</span>
          )}
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${grandOutstanding > 0 ? "text-primary" : "text-emerald-400"}`}>
            {grandOutstanding > 0 ? formatGold(grandOutstanding) : "✓ Settled"}
          </p>
          {grandOutstanding > 0 && (
            <p className="text-ink-faint text-xs mt-0.5">{formatGold(totalPaid)} paid of {formatGold(totalOwed)}</p>
          )}
        </div>
      </div>

      {/* Settlement bar */}
      {totalOwed > 0 && (
        <div className="bg-surface border border-rim rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-ink-faint">Settlement progress</span>
            <span className={`font-bold ${grandOutstanding > 0 ? "text-primary" : "text-emerald-400"}`}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: grandOutstanding === 0 ? "#34d399" : "var(--theme-primary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      {batches.length === 0 ? (
        <div className="bg-surface border border-rim rounded-2xl p-10 text-center">
          <p className="text-ink-dim text-sm">No craft batches yet.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-4">
            Craft History · {batches.length} batch{batches.length !== 1 ? "es" : ""}
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-rim" />

            <div className="space-y-4">
              {batches.map((batch, i) => {
                const dotColor = batch.isFullyPaid
                  ? "#34d399"  // emerald
                  : batch.isPartial
                  ? "#fbbf24"  // amber
                  : "var(--theme-primary)";

                return (
                  <div key={batch.id} className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative shrink-0 flex flex-col items-center" style={{ width: 40 }}>
                      <div
                        className="relative z-10 w-4 h-4 rounded-full mt-3 ring-2 ring-canvas shrink-0"
                        style={{ background: dotColor }}
                      />
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0 bg-surface border border-rim rounded-xl overflow-hidden shadow-lg shadow-black/20 mb-1">
                      {/* Card header */}
                      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-rim/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemTypeIcon type={batch.itemType} size={15} />
                          <span className="text-ink font-semibold text-sm truncate">{batch.itemName}</span>
                          <ItemTypeBadge type={batch.itemType} small />
                        </div>
                        <span className="text-xs text-ink-faint shrink-0 whitespace-nowrap">
                          {formatDate(batch.craftedAt)}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="px-4 py-3 space-y-2.5">
                        {/* Stats row */}
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div>
                            <p className="text-ink-faint mb-0.5">Crafted</p>
                            <p className="text-ink font-semibold">
                              {batch.quantity} × {formatGold(batch.costPerUnit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-ink-faint mb-0.5">Total value</p>
                            <p className="text-ink font-semibold">{formatGold(batch.totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-ink-faint mb-0.5">Used</p>
                            <p className={`font-semibold ${batch.usedQty === 0 ? "text-ink-faint" : "text-ink"}`}>
                              {batch.usedQty}/{batch.quantity}
                              {batch.unusedQty > 0 && (
                                <span className="text-amber-400/70 ml-1">({batch.unusedQty} unused)</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Payment row */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-rim/40">
                          <div className="text-xs">
                            {batch.isFullyPaid ? (
                              <span className="text-emerald-400 font-medium">✓ Paid {formatGold(batch.paidAmount)}</span>
                            ) : batch.isPartial ? (
                              <span className="text-amber-400">{formatGold(batch.paidAmount)} paid · {formatGold(batch.outstanding)} remaining</span>
                            ) : (
                              <span className="text-primary/70">{formatGold(batch.totalValue)} unpaid</span>
                            )}
                          </div>
                          <BatchPayButton
                            batchId={batch.id}
                            paidAmount={batch.paidAmount}
                            owedAmount={batch.totalValue}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
