export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { RaidNightForm } from "@/components/usage/RaidNightForm";
import type { EntryState } from "@/components/usage/RaidNightEntryRow";

export default async function EditRaidNightPage({ params }: { params: Promise<{ dateKey: string }> }) {
  const { dateKey } = await params;

  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(`${dateKey}T23:59:59.999Z`);

  const [logs, crafters, batches, presets] = await Promise.all([
    prisma.usageLog.findMany({
      where: { raidDate: { gte: start, lte: end } },
      orderBy: { raidDate: "asc" },
    }),
    prisma.crafter.findMany({ orderBy: { characterName: "asc" } }),
    prisma.craftBatch.findMany({
      orderBy: { craftedAt: "asc" },
      include: { crafter: true, usageLines: { select: { quantity: true } } },
    }),
    prisma.notePreset.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  if (logs.length === 0) notFound();

  const batchSummaries = batches
    .filter((b) => b.crafter.active || b.itemType === "VANTUS_RUNE")
    .map((b) => ({
      itemType: b.itemType,
      itemName: b.itemName,
      remaining: b.quantity - b.usageLines.reduce((s, l) => s + l.quantity, 0),
      craftedAt: b.craftedAt,
      crafter: b.crafter.characterName,
      crafterId: b.crafterId,
    }))
    .filter((b) => b.remaining > 0);

  const initialEntries: EntryState[] = logs.map((log, i) => ({
    key: i,
    itemType: log.itemType,
    itemName: log.itemName ?? "",
    quantityUsed: log.quantityUsed,
    crafterId: log.crafterId ?? "",
    notes: log.notes ?? "",
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Usage Log</p>
        <h1 className="text-3xl font-bold text-ink">Edit Raid Night</h1>
        <p className="text-ink-dim mt-1 text-sm">
          {new Date(start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <RaidNightForm
        crafters={crafters}
        batches={batchSummaries}
        today={dateKey}
        presets={presets}
        initialEntries={initialEntries}
        logIdsToDelete={logs.map((l) => l.id)}
      />
    </div>
  );
}
