"use client";

import { useState } from "react";

interface Props {
  breakdown: { crafterName: string; remaining: number }[];
  children: React.ReactNode;
  className?: string;
}

export function InventoryBreakdown({ breakdown, children, className }: Props) {
  const [open, setOpen] = useState(false);
  const hasBreakdown = breakdown.length > 0;

  return (
    <div>
      <div
        className={`${className ?? ""}${hasBreakdown ? " cursor-pointer" : ""}`}
        onClick={() => hasBreakdown && setOpen((v) => !v)}
      >
        {children}
      </div>
      {open && (
        <div className="border-t border-rim/40 px-4 pt-2 pb-3 space-y-1.5">
          {breakdown.map((b) => (
            <div key={b.crafterName} className="flex items-center justify-between gap-4">
              <span className="text-ink-faint text-xs">{b.crafterName}</span>
              <span className="text-ink-dim font-semibold text-xs">{b.remaining}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
