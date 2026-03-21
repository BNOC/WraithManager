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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Usage Log</h1>
          <p className="text-zinc-400 mt-1">
            {logs.length} sessions · {totalUsed} items used · {formatGold(totalValue)} total value
          </p>
        </div>
        <Link
          href="/usage/new"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Log Usage
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 text-lg">No usage logged yet.</p>
          <Link href="/usage/new" className="mt-4 inline-block text-yellow-400 hover:text-yellow-300">
            Log first raid night usage →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const lineValue = log.lines.reduce(
              (s, l) => s + l.quantity * l.costPerUnit,
              0
            );
            const unattributed = log.quantityUsed - log.lines.reduce((s, l) => s + l.quantity, 0);

            return (
              <div
                key={log.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
              >
                {/* Header row */}
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <RaidDayBadge date={log.raidDate} />
                    <span className="text-zinc-100 font-medium">{formatDate(log.raidDate)}</span>
                    <ItemTypeBadge type={log.itemType} />
                    {log.itemName && (
                      <span className="text-zinc-400 text-sm">{log.itemName}</span>
                    )}
                    <span className="text-zinc-500 text-sm">×{log.quantityUsed}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-yellow-400 font-medium text-sm">
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
                <div className="px-4 py-2 space-y-1">
                  {log.lines.length === 0 ? (
                    <p className="text-zinc-600 text-xs py-1">No batch stock was available at time of logging.</p>
                  ) : (
                    log.lines.map((line) => (
                      <div key={line.id} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          ·{" "}
                          <span className="text-zinc-300">{line.quantity}</span> from{" "}
                          <span className="text-zinc-200 font-medium">
                            {line.batch.crafter.characterName}
                          </span>{" "}
                          <span className="text-zinc-600">
                            (crafted {formatDate(line.batch.craftedAt)})
                          </span>
                        </span>
                        <span className="text-zinc-500">
                          {formatGold(line.costPerUnit)}/unit ={" "}
                          {formatGold(line.quantity * line.costPerUnit)}
                        </span>
                      </div>
                    ))
                  )}
                  {unattributed > 0 && (
                    <p className="text-amber-600 text-xs">
                      ⚠ {unattributed} unit{unattributed !== 1 ? "s" : ""} unattributed — no
                      matching batch stock
                    </p>
                  )}
                  {log.notes && (
                    <p className="text-zinc-500 text-xs pt-1">{log.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
