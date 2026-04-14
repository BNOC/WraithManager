// lib/actions/batches.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";
import { requireBnoc } from "./_guard";

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
