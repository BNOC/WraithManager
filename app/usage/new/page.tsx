export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { RaidNightForm } from "@/components/RaidNightForm";

export default async function NewUsagePage() {
  const [crafters, batches, presets] = await Promise.all([
    prisma.crafter.findMany({ orderBy: { characterName: "asc" } }),
    prisma.craftBatch.findMany({
      orderBy: { craftedAt: "asc" },
      include: {
        crafter: true,
        usageLines: { select: { quantity: true } },
      },
    }),
    prisma.notePreset.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const batchSummaries = batches
    .map((b) => ({
      itemType: b.itemType,
      itemName: b.itemName,
      remaining: b.quantity - b.usageLines.reduce((s, l) => s + l.quantity, 0),
      craftedAt: b.craftedAt,
      crafter: b.crafter.characterName,
    }))
    .filter((b) => b.remaining > 0);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Log Raid Night</h1>
        <p className="text-zinc-400 mt-1">
          Log all consumables used on a single raid night — FIFO pulls from the oldest batches first
        </p>
      </div>
      <RaidNightForm
        crafters={crafters}
        batches={batchSummaries}
        today={today}
        presets={presets}
      />
    </div>
  );
}
