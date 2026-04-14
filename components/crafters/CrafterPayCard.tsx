"use client";

import { useState } from "react";
import { ItemTypeBadge } from "@/components/ui/ItemTypeBadge";
import { ItemTypeIcon } from "@/components/ui/ItemTypeIcon";
import { BatchPayButton } from "@/components/payments/BatchPayButton";
import type { CrafterPaymentStat } from "@/lib/queries/payments";

const PAGE_SIZE = 10;

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function CrafterPayCard({ crafter }: { crafter: CrafterPaymentStat }) {
  const { characterName, totalOwed, totalPaid, balance, batchRows } = crafter;
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? batchRows : batchRows.slice(0, PAGE_SIZE);
  const hiddenCount = batchRows.length - PAGE_SIZE;

  return (
    <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
      {/* Header — always visible, click to collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 border-b border-rim flex items-center justify-between flex-wrap gap-2 hover:bg-surface-hi/20 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              className={`text-ink-faint shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h2 className="text-lg font-semibold text-ink">{characterName}</h2>
          </div>
          <div className="hidden sm:flex gap-3 text-sm">
            <span className="text-ink-dim">
              Owed:{" "}
              <span className="text-primary font-medium">{formatGold(totalOwed)}</span>
            </span>
            <span className="text-ink-dim">
              Paid:{" "}
              <span className="text-green-400 font-medium">{formatGold(totalPaid)}</span>
            </span>
          </div>
        </div>
        {/* Desktop: full label — Mobile: compact */}
        <div className="shrink-0">
          <span className={`hidden sm:inline text-base font-semibold ${balance > 0 ? "text-red-400" : "text-green-400"}`}>
            {balance > 0 ? `${formatGold(balance)} outstanding` : totalOwed > 0 ? "✓ Settled" : "Nothing owed"}
          </span>
          <span className={`sm:hidden text-sm font-semibold ${balance > 0 ? "text-red-400" : "text-green-400"}`}>
            {balance > 0 ? formatGold(balance) : "Settled ✓"}
          </span>
        </div>
      </button>

      {/* Collapsible body */}
      {open && (
        <>
          {batchRows.length === 0 ? (
            <p className="px-4 py-4 text-ink-faint text-sm">No craft batches.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rim/50 bg-surface/30">
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Item</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Crafted</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Used</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Owed</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((batch) => (
                    <tr key={batch.id} className="border-b border-rim/30 hover:bg-surface-hi/10">
                      <td className="px-4 py-2.5 text-ink-dim text-xs whitespace-nowrap">
                        {formatDate(batch.craftedAt)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <ItemTypeIcon type={batch.itemType as Parameters<typeof ItemTypeIcon>[0]["type"]} size={18} />
                          <ItemTypeBadge type={batch.itemType as Parameters<typeof ItemTypeBadge>[0]["type"]} abbr />
                          <span className="text-ink text-xs">{batch.itemName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-ink-dim text-xs whitespace-nowrap">
                        {batch.quantity} × {formatGold(batch.costPerUnit)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-ink-dim text-xs">
                        {batch.usedQty > 0 ? (
                          <span>{batch.usedQty}/{batch.quantity}</span>
                        ) : (
                          <span className="text-ink-faint">0/{batch.quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-primary font-medium text-xs">
                          {formatGold(batch.owedAmount)}
                        </span>
                        {batch.unusedQty > 0 && (
                          <p className="text-ink-faint text-xs mt-0.5">{batch.unusedQty} unused</p>
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
              </div>
              {!showAll && hiddenCount > 0 && (
                <div className="px-4 py-2.5 border-t border-rim/30 bg-surface-hi/10">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="text-xs text-ink-faint hover:text-ink-dim transition-colors"
                  >
                    Show {hiddenCount} older record{hiddenCount !== 1 ? "s" : ""} ↓
                  </button>
                </div>
              )}
              {showAll && batchRows.length > PAGE_SIZE && (
                <div className="px-4 py-2.5 border-t border-rim/30 bg-surface-hi/10">
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="text-xs text-ink-faint hover:text-ink-dim transition-colors"
                  >
                    Show less ↑
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
