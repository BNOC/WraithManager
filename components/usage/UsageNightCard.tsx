"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemTypeBadge } from "@/components/ui/ItemTypeBadge";
import { ItemTypeIcon } from "@/components/ui/ItemTypeIcon";
import { RaidDayBadge } from "@/components/ui/RaidDayBadge";
import type { UsageNightCardProps, UsageNightCardLog as UsageLogRow } from "@/lib/queries/usage";
export type { UsageNightCardProps };

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

const TYPE_ORDER: Record<string, number> = {
  FEAST: 0,
  FLASK_CAULDRON: 1,
  POTION_CAULDRON: 2,
};

function sortLogs(logs: UsageLogRow[]) {
  return [...logs].sort((a, b) => {
    const oa = TYPE_ORDER[a.itemType] ?? 99;
    const ob = TYPE_ORDER[b.itemType] ?? 99;
    return oa !== ob ? oa - ob : a.itemType.localeCompare(b.itemType);
  });
}

function LogRow({ log }: { log: UsageLogRow }) {
  return (
    <div className="px-4 py-3 flex gap-3">
      <div className="shrink-0 mt-0.5">
        <ItemTypeIcon type={log.itemType as Parameters<typeof ItemTypeIcon>[0]["type"]} size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <ItemTypeBadge
              type={log.itemType as Parameters<typeof ItemTypeBadge>[0]["type"]}
              small
              label={log.itemType === "FEAST" && log.itemName ? `Feast - ${log.itemName}` : undefined}
            />
            <span className="text-ink font-bold text-sm">×{log.quantityUsed}</span>
          </div>
          <span className="text-ink-dim text-sm font-medium shrink-0">
            {log.lineValue > 0 ? formatGoldAbbr(log.lineValue) : "—"}
          </span>
        </div>
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
  );
}

export function UsageNightCard({ dateKey, raidDate, nightValue, logs, defaultOpen = false }: UsageNightCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Group by notes label
  const groups = new Map<string, UsageLogRow[]>();
  for (const log of logs) {
    const key = log.notes?.trim() || "__none__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  const unlabelled = groups.get("__none__") ?? [];
  const labelled = [...groups.entries()].filter(([k]) => k !== "__none__");
  const totalItems = logs.reduce((s, l) => s + l.quantityUsed, 0);

  return (
    <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-rim bg-surface-hi/40 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12"
            className={`text-ink-faint shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <RaidDayBadge date={new Date(raidDate)} />
          <span className="text-ink font-semibold">{formatDate(raidDate)}</span>
          <span className="text-ink-dim text-sm">{totalItems} used</span>
          {!open && labelled.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {labelled.map(([label]) => (
                <span key={label} className="text-[10px] text-ink-faint bg-surface-hi border border-rim px-1.5 py-px rounded-md">
                  {label}
                </span>
              ))}
            </div>
          )}
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

      {/* Body */}
      {open && (
        <div>
          {/* Unlabelled logs */}
          {unlabelled.length > 0 && (
            <div className="divide-y divide-rim/50">
              {sortLogs(unlabelled).map((log) => <LogRow key={log.id} log={log} />)}
            </div>
          )}

          {/* Labelled groups */}
          {labelled.map(([label, groupLogs], gi) => {
            const groupValue = groupLogs.reduce((s, l) => s + l.lineValue, 0);
            return (
              <div key={label}>
                <div className={`flex items-center gap-3 px-4 py-2 bg-surface-hi/20 ${gi > 0 || unlabelled.length > 0 ? "border-t border-rim/50" : ""}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">{label}</span>
                  <div className="flex-1 h-px bg-rim/40" />
                  <span className="text-[10px] text-ink-faint tabular-nums">{formatGoldAbbr(groupValue)}</span>
                </div>
                <div className="divide-y divide-rim/50">
                  {sortLogs(groupLogs).map((log) => <LogRow key={log.id} log={log} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
