"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { ItemTypeIcon } from "@/components/ItemTypeIcon";
import { RaidDayBadge } from "@/components/RaidDayBadge";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface UsageLine {
  id: string;
  quantity: number;
  costPerUnit: number;
  crafterName: string;
  batchCraftedAt: string;
}

export interface UsageLogRow {
  id: string;
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  notes: string | null;
  lineValue: number;
  unattributed: number;
  lines: UsageLine[];
}

export interface UsageNightCardProps {
  dateKey: string;
  raidDate: string;
  nightValue: number;
  logs: UsageLogRow[];
}

export function UsageNightCard({ dateKey, raidDate, nightValue, logs }: UsageNightCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
      {/* Night header — click to collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 border-b border-rim bg-surface-hi/40 flex items-center justify-between gap-3 flex-wrap hover:bg-surface-hi/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
            className={`text-ink-faint shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <RaidDayBadge date={new Date(raidDate)} />
          <span className="text-ink font-semibold">{formatDate(raidDate)}</span>
          <span className="text-ink-dim text-sm">{logs.length} item{logs.length !== 1 ? "s" : ""}</span>
        </div>
        <span className="text-primary font-medium text-sm">
          {nightValue > 0 ? formatGold(nightValue) : "—"}
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="divide-y divide-rim/50">
          {logs.map((log) => (
            <div key={log.id} className="px-4 py-3 flex gap-3">
              {/* Type icon */}
              <div className="shrink-0 mt-0.5">
                <ItemTypeIcon type={log.itemType as Parameters<typeof ItemTypeIcon>[0]["type"]} size={28} />
              </div>

              <div className="flex-1 min-w-0">
              {/* Item header */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ItemTypeBadge type={log.itemType as Parameters<typeof ItemTypeBadge>[0]["type"]} />
                  {log.itemName && (
                    <span className="text-ink text-sm font-medium">{log.itemName}</span>
                  )}
                  <span className="text-ink-dim text-sm">×{log.quantityUsed}</span>
                  {log.notes && (
                    <span className="bg-surface-hi border border-rim text-ink-dim text-xs px-1.5 py-0.5 rounded-lg">
                      {log.notes}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ink-dim text-sm">
                    {log.lineValue > 0 ? formatGold(log.lineValue) : "—"}
                  </span>
                  <Link
                    href={`/usage/${log.id}/edit`}
                    className="text-xs text-ink-faint hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>

              {/* FIFO attribution lines */}
              <div className="space-y-0.5 pl-2">
                {log.lines.length === 0 ? (
                  <p className="text-ink-faint text-xs">No batch stock was available at time of logging.</p>
                ) : (
                  log.lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between text-xs">
                      <span className="text-ink-dim">
                        ·{" "}
                        <span className="text-ink-dim">{line.quantity}</span> from{" "}
                        <span className="text-ink font-medium">{line.crafterName}</span>{" "}
                        <span className="text-ink-faint">(crafted {formatDate(line.batchCraftedAt)})</span>
                      </span>
                      <span className="text-ink-faint">
                        {formatGold(line.costPerUnit)}/unit = {formatGold(line.quantity * line.costPerUnit)}
                      </span>
                    </div>
                  ))
                )}
                {log.unattributed > 0 && (
                  <p className="text-amber-400 text-xs">
                    ⚠ {log.unattributed} unit{log.unattributed !== 1 ? "s" : ""} unattributed — no matching batch stock
                  </p>
                )}
              </div>
              </div>{/* flex-1 */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

