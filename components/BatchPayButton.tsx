"use client";

import { useState, useTransition } from "react";
import { updateBatchPaidAmount } from "@/lib/actions/payments";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export function BatchPayButton({
  batchId,
  paidAmount,
  owedAmount,
}: {
  batchId: string;
  paidAmount: number;
  owedAmount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState(paidAmount.toString());

  if (owedAmount === 0) {
    return <span className="text-ink-faint text-xs">Nothing owed</span>;
  }

  const isFullyPaid = paidAmount >= owedAmount;

  function markPaid() {
    startTransition(() => updateBatchPaidAmount(batchId, owedAmount));
  }

  function submitPartial() {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0) {
      startTransition(() => updateBatchPaidAmount(batchId, val));
      setShowInput(false);
    }
  }

  if (isFullyPaid) {
    return <span className="text-green-400 text-xs font-medium">✓ Paid {formatGold(paidAmount)}</span>;
  }

  if (showInput) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          max={owedAmount}
          step="1"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-24 bg-surface-hi border border-rim rounded-lg px-2 py-0.5 text-xs text-ink focus:outline-none focus:border-primary"
        />
        <button
          onClick={submitPartial}
          disabled={isPending}
          className="text-xs bg-primary hover:opacity-90 text-white font-medium px-2 py-0.5 rounded-lg transition-opacity disabled:opacity-50"
        >
          {isPending ? "…" : "Save"}
        </button>
        <button
          onClick={() => setShowInput(false)}
          className="text-xs text-ink-faint hover:text-ink-dim transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {paidAmount > 0 && (
        <span className="text-amber-400 text-xs">
          {formatGold(paidAmount)} paid
        </span>
      )}
      <button
        onClick={markPaid}
        disabled={isPending}
        className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-0.5 rounded hover:bg-green-800/50 transition-colors disabled:opacity-50"
      >
        {isPending ? "…" : "Mark Paid"}
      </button>
      <button
        onClick={() => { setInputVal(paidAmount.toString()); setShowInput(true); }}
        className="text-xs text-ink-dim hover:text-ink transition-colors"
      >
        Part-paid
      </button>
    </div>
  );
}
