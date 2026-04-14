// lib/actions/usage.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";

export type RaidNightEntry = {
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  crafterId: string | null;
  notes: string | null;
};

async function fifoAttributeUsage(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  opts: {
    raidDate: Date;
    itemType: ItemType;
    itemName: string | null;
    quantityUsed: number;
    crafterId: string | null;
    notes: string | null;
  }
) {
  const batches = await tx.craftBatch.findMany({
    where: {
      itemType: opts.itemType,
      itemName: opts.itemName ?? undefined,
      ...(opts.crafterId ? { crafterId: opts.crafterId } : {}),
    },
    include: { usageLines: { select: { quantity: true } } },
    orderBy: { craftedAt: "asc" },
  });

  const available = batches
    .map((b) => ({
      id: b.id,
      costPerUnit: b.costPerUnit,
      remaining: b.quantity - b.usageLines.reduce((s: number, l: { quantity: number }) => s + l.quantity, 0),
    }))
    .filter((b) => b.remaining > 0);

  let toAssign = opts.quantityUsed;
  const lines: { batchId: string; quantity: number; costPerUnit: number }[] = [];
  for (const batch of available) {
    if (toAssign <= 0) break;
    const take = Math.min(toAssign, batch.remaining);
    lines.push({ batchId: batch.id, quantity: take, costPerUnit: batch.costPerUnit });
    toAssign -= take;
  }

  const log = await tx.usageLog.create({
    data: {
      raidDate: opts.raidDate,
      itemType: opts.itemType,
      itemName: opts.itemName,
      quantityUsed: opts.quantityUsed,
      notes: opts.notes,
      crafterId: opts.crafterId,
    },
  });

  if (lines.length > 0) {
    await tx.usageLine.createMany({
      data: lines.map((l) => ({ ...l, usageLogId: log.id })),
    });
  }
}

export async function createRaidNightUsage(raidDate: string, entries: RaidNightEntry[]) {
  if (!entries.length) return;
  const date = new Date(raidDate);

  await prisma.$transaction(async (tx) => {
    for (const entry of entries) {
      await fifoAttributeUsage(tx, {
        raidDate: date,
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName,
        quantityUsed: entry.quantityUsed,
        crafterId: entry.crafterId,
        notes: entry.notes,
      });
    }
  });

  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/usage");
}

export async function deleteUsageLog(id: string) {
  await prisma.usageLog.delete({ where: { id } });
  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
}

export async function updateUsageLog(id: string, raidDate: string, entry: RaidNightEntry) {
  const date = new Date(raidDate);

  await prisma.$transaction(async (tx) => {
    await tx.usageLine.deleteMany({ where: { usageLogId: id } });

    await tx.usageLog.update({
      where: { id },
      data: {
        raidDate: date,
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName,
        quantityUsed: entry.quantityUsed,
        notes: entry.notes,
        crafterId: entry.crafterId,
      },
    });

    const batches = await tx.craftBatch.findMany({
      where: {
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName ?? undefined,
        ...(entry.crafterId ? { crafterId: entry.crafterId } : {}),
      },
      include: { usageLines: { select: { quantity: true } } },
      orderBy: { craftedAt: "asc" },
    });

    const available = batches
      .map((b) => ({
        id: b.id,
        costPerUnit: b.costPerUnit,
        remaining: b.quantity - b.usageLines.reduce((s: number, l: { quantity: number }) => s + l.quantity, 0),
      }))
      .filter((b) => b.remaining > 0);

    let toAssign = entry.quantityUsed;
    const lines: { batchId: string; quantity: number; costPerUnit: number }[] = [];
    for (const batch of available) {
      if (toAssign <= 0) break;
      const take = Math.min(toAssign, batch.remaining);
      lines.push({ batchId: batch.id, quantity: take, costPerUnit: batch.costPerUnit });
      toAssign -= take;
    }

    if (lines.length > 0) {
      await tx.usageLine.createMany({
        data: lines.map((l) => ({ ...l, usageLogId: id })),
      });
    }
  });

  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/usage");
}

export async function updateRaidNight(logIds: string[], newDate: string, entries: RaidNightEntry[]) {
  const date = new Date(newDate);
  await prisma.$transaction(async (tx) => {
    await tx.usageLine.deleteMany({ where: { usageLogId: { in: logIds } } });
    await tx.usageLog.deleteMany({ where: { id: { in: logIds } } });
    for (const entry of entries) {
      await fifoAttributeUsage(tx, {
        raidDate: date,
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName,
        quantityUsed: entry.quantityUsed,
        crafterId: entry.crafterId,
        notes: entry.notes,
      });
    }
  });
  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/usage");
}
