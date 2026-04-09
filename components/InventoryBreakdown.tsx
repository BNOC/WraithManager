"use client";

import { useState } from "react";

interface Props {
  breakdown: { crafterName: string; remaining: number }[];
  children: React.ReactNode;
  className?: string;
}

export function InventoryBreakdown({ breakdown, children, className }: Props) {
  const [open, setOpen] = useState(false);

  if (breakdown.length === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <div
        className={`cursor-pointer select-none ${className ?? ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </div>
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popover — fixed to center so overflow:hidden on parent doesn't clip it */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-surface border border-rim rounded-2xl shadow-2xl shadow-black/70 p-4 min-w-[200px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-3">
              Inventory by Crafter
            </p>
            <div className="space-y-2">
              {breakdown.map((b) => (
                <div key={b.crafterName} className="flex items-center justify-between gap-8">
                  <span className="text-ink-dim text-sm">{b.crafterName}</span>
                  <span className="text-ink font-bold text-sm">{b.remaining}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
