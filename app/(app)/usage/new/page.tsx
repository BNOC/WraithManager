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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Usage Log</p>
        <h1 className="text-3xl font-bold text-ink">Log Raid Night</h1>
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
