"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "./prisma";
import { ItemType } from "@prisma/client";
import { verifySessionToken, SESSION_COOKIE } from "./auth";

async function requireBnoc() {
  const cookieStore = await cookies();
  const user = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (user?.toLowerCase() !== "bnoc") throw new Error("Unauthorised");
}

// ---- Crafter actions ----

export async function createCrafter(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.crafter.create({
    data: { name, characterName: name },
  });

  revalidatePath("/crafters");
  redirect("/crafters");
}

export async function setCrafterActive(id: string, active: boolean) {
  await prisma.crafter.update({ where: { id }, data: { active } });
  revalidatePath("/crafters");
  revalidatePath("/payments");
  revalidatePath("/");
}

export async function updateCrafter(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const characterName = formData.get("characterName") as string;

  await prisma.crafter.update({
    where: { id },
    data: { name, characterName },
  });

  revalidatePath("/crafters");
  redirect("/crafters");
}

// ---- Craft batch actions ----

export async function createCraftBatch(formData: FormData) {
  const crafterId = formData.get("crafterId") as string;
  const itemType = formData.get("itemType") as ItemType;
  const itemName = formData.get("itemName") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const costPerUnit = parseFloat(formData.get("costPerUnit") as string);
  const craftedAtStr = formData.get("craftedAt") as string;
  const notes = formData.get("notes") as string;

  const craftedAt = craftedAtStr ? new Date(craftedAtStr) : new Date();

  await prisma.$transaction(async (tx) => {
    const batch = await tx.craftBatch.create({
      data: {
        crafterId,
        itemType,
        itemName,
        quantity,
        costPerUnit,
        craftedAt,
        notes: notes || null,
      },
    });

    // Retroactively attribute any unattributed usage logs for this crafter + item
    const unattributedLogs = await tx.usageLog.findMany({
      where: {
        crafterId,
        itemType,
        itemName: itemName || undefined,
      },
      include: { lines: { select: { quantity: true } } },
      orderBy: { raidDate: "asc" },
    });

    let batchRemaining = quantity;

    for (const log of unattributedLogs) {
      if (batchRemaining <= 0) break;
      const attributed = log.lines.reduce((s, l) => s + l.quantity, 0);
      const unattributed = log.quantityUsed - attributed;
      if (unattributed <= 0) continue;

      const take = Math.min(unattributed, batchRemaining);
      await tx.usageLine.create({
        data: {
          usageLogId: log.id,
          batchId: batch.id,
          quantity: take,
          costPerUnit,
        },
      });
      batchRemaining -= take;
    }
  });

  revalidatePath("/consumables");
  revalidatePath("/usage");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/consumables");
}

export async function updateCraftBatch(id: string, formData: FormData) {
  await requireBnoc();

  const crafterId = formData.get("crafterId") as string;
  const itemType = formData.get("itemType") as ItemType;
  const itemName = formData.get("itemName") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const costPerUnit = parseFloat(formData.get("costPerUnit") as string);
  const craftedAtStr = formData.get("craftedAt") as string;
  const notes = formData.get("notes") as string;
  const craftedAt = craftedAtStr ? new Date(craftedAtStr) : new Date();

  await prisma.$transaction(async (tx) => {
    await tx.craftBatch.update({
      where: { id },
      data: { crafterId, itemType, itemName, quantity, costPerUnit, craftedAt, notes: notes || null },
    });
    // Cascade cost change to usage line snapshots for this batch
    await tx.usageLine.updateMany({
      where: { batchId: id },
      data: { costPerUnit },
    });
  });

  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/consumables");
}

export async function deleteCraftBatch(id: string) {
  await requireBnoc();

  await prisma.$transaction(async (tx) => {
    await tx.usageLine.deleteMany({ where: { batchId: id } });
    await tx.craftBatch.delete({ where: { id } });
  });

  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/consumables");
}

// ---- Usage log actions ----

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

export type RaidNightEntry = {
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  crafterId: string | null;
  notes: string | null;
};

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
    // Delete existing attribution lines
    await tx.usageLine.deleteMany({ where: { usageLogId: id } });

    // Update the log record
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

    // Re-run FIFO attribution
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

// ---- Payment actions ----

export async function updateBatchPaidAmount(batchId: string, amount: number) {
  await prisma.craftBatch.update({
    where: { id: batchId },
    data: { paidAmount: amount },
  });

  revalidatePath("/payments");
  revalidatePath("/consumables");
  revalidatePath("/");
}

// ---- Note preset actions ----

export async function createNotePreset(label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  await prisma.notePreset.create({ data: { label: trimmed } });
  revalidatePath("/usage/new");
}

export async function updateNotePreset(id: string, label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  await prisma.notePreset.update({ where: { id }, data: { label: trimmed } });
  revalidatePath("/usage/new");
}

export async function deleteNotePreset(id: string) {
  await prisma.notePreset.delete({ where: { id } });
  revalidatePath("/usage/new");
}

// ---- Price config actions ----

export async function createPriceConfig(formData: FormData) {
  const itemType = formData.get("itemType") as ItemType;
  const price = parseFloat(formData.get("price") as string);
  const effectiveDateStr = formData.get("effectiveDate") as string;
  const notes = formData.get("notes") as string;

  const effectiveDate = effectiveDateStr ? new Date(effectiveDateStr) : new Date();

  await prisma.priceConfig.create({
    data: { itemType, price, effectiveDate, notes: notes || null },
  });

  revalidatePath("/prices");
  revalidatePath("/consumables/new");
  redirect("/prices");
}
