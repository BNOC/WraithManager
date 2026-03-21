export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import { RaidDayBadge } from "@/components/RaidDayBadge";
import { deleteUsageLog } from "@/lib/actions";

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
          <h1 className="text-3xl font-bold text-yellow-400">Usage Log</h1>
          <p className="text-zinc-400 mt-1">
            {nightEntries.length} raid night{nightEntries.length !== 1 ? "s" : ""} · {totalUsed} items used · {formatGold(totalValue)} total value
          </p>
        </div>
        <Link
          href="/usage/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Log Raid Night
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 text-lg">No usage logged yet.</p>
          <Link href="/usage/new" className="mt-4 inline-block text-yellow-400 hover:text-yellow-300">
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
              <div key={dateKey} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                {/* Night header */}
                <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-800/30 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <RaidDayBadge date={firstLog.raidDate} />
                    <span className="text-zinc-100 font-semibold">{formatDate(firstLog.raidDate)}</span>
                    <span className="text-zinc-500 text-sm">{nightLogs.length} item{nightLogs.length !== 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-yellow-400 font-medium text-sm">
                    {nightValue > 0 ? formatGold(nightValue) : "—"}
                  </span>
                </div>

                {/* Individual items for this night */}
                <div className="divide-y divide-zinc-800/50">
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
                              <span className="text-zinc-300 text-sm font-medium">{log.itemName}</span>
                            )}
                            <span className="text-zinc-500 text-sm">×{log.quantityUsed}</span>
                            {log.notes && (
                              <span className="text-zinc-500 text-xs bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                                {log.notes}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400 text-sm">
                              {lineValue > 0 ? formatGold(lineValue) : "—"}
                            </span>
                            <form action={deleteUsageLog.bind(null, log.id)}>
                              <button
                                type="submit"
                                className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* FIFO attribution lines */}
                        <div className="space-y-0.5 pl-2">
                          {log.lines.length === 0 ? (
                            <p className="text-zinc-600 text-xs">No batch stock was available at time of logging.</p>
                          ) : (
                            log.lines.map((line) => (
                              <div key={line.id} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">
                                  ·{" "}
                                  <span className="text-zinc-400">{line.quantity}</span> from{" "}
                                  <span className="text-zinc-300 font-medium">
                                    {line.batch.crafter.characterName}
                                  </span>{" "}
                                  <span className="text-zinc-600">
                                    (crafted {formatDate(line.batch.craftedAt)})
                                  </span>
                                </span>
                                <span className="text-zinc-600">
                                  {formatGold(line.costPerUnit)}/unit = {formatGold(line.quantity * line.costPerUnit)}
                                </span>
                              </div>
                            ))
                          )}
                          {unattributed > 0 && (
                            <p className="text-amber-600 text-xs">
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
