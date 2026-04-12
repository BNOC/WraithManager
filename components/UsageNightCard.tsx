"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { ItemTypeIcon } from "@/components/ItemTypeIcon";
import { RaidDayBadge } from "@/components/RaidDayBadge";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatGoldAbbr(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}m`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
  return `${Math.round(n)}g`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  defaultOpen?: boolean;
}

export function UsageNightCard({ dateKey, raidDate, nightValue, logs, defaultOpen = false }: UsageNightCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
      {/* Night header — click to collapse */}
      <div className="px-4 py-3 border-b border-rim bg-surface-hi/40 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
            className={`text-ink-faint shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <RaidDayBadge date={new Date(raidDate)} />
          <span className="text-ink font-semibold">{formatDate(raidDate)}</span>
          <span className="text-ink-dim text-sm">{logs.length} item{logs.length !== 1 ? "s" : ""}</span>
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-primary font-medium text-sm">
            {nightValue > 0 ? formatGold(nightValue) : "—"}
          </span>
          <Link
            href={`/usage/night/${dateKey}/edit`}
            className="text-xs text-ink-faint hover:text-primary transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

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
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <ItemTypeBadge
                      type={log.itemType as Parameters<typeof ItemTypeBadge>[0]["type"]}
                      small
                      label={log.itemType === "FEAST" && log.itemName ? `Feast - ${log.itemName}` : undefined}
                    />
                    <span className="text-ink font-bold text-sm">×{log.quantityUsed}</span>
                    {log.notes && (
                      <span className="bg-surface-hi border border-rim text-ink-dim text-xs px-1.5 py-0.5 rounded-lg">
                        {log.notes}
                      </span>
                    )}
                  </div>
                  <span className="text-ink-dim text-sm font-medium shrink-0">
                    {log.lineValue > 0 ? formatGoldAbbr(log.lineValue) : "—"}
                  </span>
                </div>

                {/* Attribution lines */}
                <div className="space-y-0.5 pl-1">
                  {log.lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-ink-dim">
                        · {line.quantity} from{" "}
                        <span className="text-ink font-medium">{line.crafterName}</span>{" "}
                        <span className="text-ink-faint">({formatDateShort(line.batchCraftedAt)})</span>
                      </span>
                      <span className="text-ink-faint shrink-0">{formatGoldAbbr(line.costPerUnit)}/unit</span>
                    </div>
                  ))}
                  {log.unattributed > 0 && (
                    <p className="text-amber-400 text-xs">
                      ⏳ {log.unattributed} unit{log.unattributed !== 1 ? "s" : ""} pending — will resolve when craft is logged
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

