export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { UsageEditForm } from "@/components/UsageEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUsagePage({ params }: PageProps) {
  const { id } = await params;

  const [log, crafters, batches, presets] = await Promise.all([
    prisma.usageLog.findUnique({ where: { id } }),
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

  if (!log) notFound();

  const initialCrafterId = log.crafterId ?? "";

  const batchSummaries = batches
    .map((b) => ({
      itemType: b.itemType,
      itemName: b.itemName,
      remaining: b.quantity - b.usageLines.reduce((s, l) => s + l.quantity, 0),
      craftedAt: b.craftedAt,
      crafter: b.crafter.characterName,
      crafterId: b.crafterId,
    }))
    .filter((b) => b.remaining > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Usage Log</p>
        <h1 className="text-3xl font-bold text-ink">Edit Usage Entry</h1>
        <p className="text-ink-dim mt-1">Update the details for this usage record.</p>
      </div>
      <UsageEditForm
        log={{
          id: log.id,
          raidDate: log.raidDate.toISOString().slice(0, 10),
          itemType: log.itemType,
          itemName: log.itemName,
          quantityUsed: log.quantityUsed,
          notes: log.notes,
          crafterId: initialCrafterId,
        }}
        crafters={crafters}
        batches={batchSummaries}
        presets={presets}
      />
    </div>
  );
}
