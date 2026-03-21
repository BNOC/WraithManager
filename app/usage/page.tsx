export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { RaidDayBadge } from "@/components/RaidDayBadge";

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

function toDateKey(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function UsagePage() {
  const logs = await prisma.usageLog.findMany({
    orderBy: { raidDate: "desc" },
    include: {
      lines: {
        include: { batch: { include: { crafter: true } } },
      },
    },
  });

  const totalUsed = logs.reduce((s, l) => s + l.quantityUsed, 0);
  const totalValue = logs.reduce(
    (s, l) => s + l.lines.reduce((ls, line) => ls + line.quantity * line.costPerUnit, 0),
    0
  );

  // Group logs by raidDate
  const nights = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = toDateKey(log.raidDate);
    if (!nights.has(key)) nights.set(key, []);
    nights.get(key)!.push(log);
  }
  const nightEntries = [...nights.entries()]; // already desc order from the query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Usage Log</p>
          <h1 className="text-3xl font-bold text-ink">Usage</h1>
          <p className="text-ink-dim mt-1">
            {nightEntries.length} raid night{nightEntries.length !== 1 ? "s" : ""} · {totalUsed} items used · {formatGold(totalValue)} total value
          </p>
        </div>
        <Link
          href="/usage/new"
          className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm"
        >
          + Log Raid Night
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="bg-surface border border-rim rounded-2xl p-12 text-center shadow-lg shadow-black/30">
          <p className="text-ink-dim text-lg">No usage logged yet.</p>
          <Link href="/usage/new" className="mt-4 inline-block text-primary hover:opacity-80">
            Log first raid night →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {nightEntries.map(([dateKey, nightLogs]) => {
            const nightValue = nightLogs.reduce(
              (s, log) => s + log.lines.reduce((ls, l) => ls + l.quantity * l.costPerUnit, 0),
              0
            );
            const firstLog = nightLogs[0];

            return (
              <div key={dateKey} className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
                {/* Night header */}
                <div className="px-4 py-3 border-b border-rim bg-surface-hi/40 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <RaidDayBadge date={firstLog.raidDate} />
                    <span className="text-ink font-semibold">{formatDate(firstLog.raidDate)}</span>
                    <span className="text-ink-dim text-sm">{nightLogs.length} item{nightLogs.length !== 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-primary font-medium text-sm">
                    {nightValue > 0 ? formatGold(nightValue) : "—"}
                  </span>
                </div>

                {/* Individual items for this night */}
                <div className="divide-y divide-rim/50">
                  {nightLogs.map((log) => {
                    const lineValue = log.lines.reduce(
                      (s, l) => s + l.quantity * l.costPerUnit,
                      0
                    );
                    const unattributed = log.quantityUsed - log.lines.reduce((s, l) => s + l.quantity, 0);

                    return (
                      <div key={log.id} className="px-4 py-3">
                        {/* Item header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ItemTypeBadge type={log.itemType} />
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
                              {lineValue > 0 ? formatGold(lineValue) : "—"}
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
                                  <span className="text-ink font-medium">
                                    {line.batch.crafter.characterName}
                                  </span>{" "}
                                  <span className="text-ink-faint">
                                    (crafted {formatDate(line.batch.craftedAt)})
                                  </span>
                                </span>
                                <span className="text-ink-faint">
                                  {formatGold(line.costPerUnit)}/unit = {formatGold(line.quantity * line.costPerUnit)}
                                </span>
                              </div>
                            ))
                          )}
                          {unattributed > 0 && (
                            <p className="text-amber-400 text-xs">
                              ⚠ {unattributed} unit{unattributed !== 1 ? "s" : ""} unattributed — no matching batch stock
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
