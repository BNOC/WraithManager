"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "./prisma";
import { ItemType } from "@prisma/client";

// ---- Crafter actions ----

export async function createCrafter(formData: FormData) {
  const name = formData.get("name") as string;
  const characterName = formData.get("characterName") as string;

  if (!name || !characterName) {
    throw new Error("Name and character name are required");
  }

  await prisma.crafter.create({
    data: { name, characterName },
  });

  revalidatePath("/crafters");
  redirect("/crafters");
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

  await prisma.craftBatch.create({
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

  revalidatePath("/consumables");
  revalidatePath("/");
  redirect("/consumables");
}

// ---- Usage log actions ----

export async function createUsageLog(formData: FormData) {
  const raidDateStr = formData.get("raidDate") as string;
  const itemType = formData.get("itemType") as ItemType;
  const itemName = (formData.get("itemName") as string) || null;
  const quantityUsed = parseInt(formData.get("quantityUsed") as string, 10);
  const crafterId = (formData.get("crafterId") as string) || null;
  const notes = formData.get("notes") as string;

  const raidDate = new Date(raidDateStr);

  // FIFO: find craft batches with remaining stock, oldest first
  const batches = await prisma.craftBatch.findMany({
    where: {
      itemType,
      itemName: itemName ?? undefined,
      ...(crafterId ? { crafterId } : {}),
    },
    include: { usageLines: { select: { quantity: true } } },
    orderBy: { craftedAt: "asc" },
  });

  const available = batches
    .map((b) => ({
      id: b.id,
      costPerUnit: b.costPerUnit,
      remaining: b.quantity - b.usageLines.reduce((s, l) => s + l.quantity, 0),
    }))
    .filter((b) => b.remaining > 0);

  // Build attribution lines
  let toAssign = quantityUsed;
  const lines: { batchId: string; quantity: number; costPerUnit: number }[] = [];

  for (const batch of available) {
    if (toAssign <= 0) break;
    const take = Math.min(toAssign, batch.remaining);
    lines.push({ batchId: batch.id, quantity: take, costPerUnit: batch.costPerUnit });
    toAssign -= take;
  }

  await prisma.$transaction(async (tx) => {
    const log = await tx.usageLog.create({
      data: {
        raidDate,
        itemType,
        itemName,
        quantityUsed,
        notes: notes || null,
      },
    });

    if (lines.length > 0) {
      await tx.usageLine.createMany({
        data: lines.map((l) => ({ ...l, usageLogId: log.id })),
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
