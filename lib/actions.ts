"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "./prisma";
import { ItemStatus, ItemType } from "@prisma/client";

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

// ---- Consumable entry actions ----

export async function createConsumableEntry(formData: FormData) {
  const crafterId = formData.get("crafterId") as string;
  const itemName = formData.get("itemName") as string;
  const itemType = formData.get("itemType") as ItemType;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const costPerUnit = parseFloat(formData.get("costPerUnit") as string);
  const raidDateStr = formData.get("raidDate") as string;
  const notes = formData.get("notes") as string;

  const totalCost = quantity * costPerUnit;
  const raidDate = raidDateStr ? new Date(raidDateStr) : null;

  const entry = await prisma.consumableEntry.create({
    data: {
      crafterId,
      itemName,
      itemType,
      quantity,
      costPerUnit,
      totalCost,
      raidDate,
      notes: notes || null,
      status: "AVAILABLE",
    },
  });

  await prisma.consumableUse.createMany({
    data: Array.from({ length: quantity }, (_, i) => ({
      entryId: entry.id,
      unitIndex: i + 1,
      status: "AVAILABLE" as ItemStatus,
    })),
  });

  revalidatePath("/consumables");
  revalidatePath("/");
  redirect("/consumables");
}

export async function updateEntryStatus(id: string, status: ItemStatus) {
  await prisma.consumableEntry.update({
    where: { id },
    data: { status },
  });

  await prisma.consumableUse.updateMany({
    where: { entryId: id },
    data: { status },
  });

  revalidatePath("/consumables");
  revalidatePath("/");
}

export async function updateUseStatus(useId: string, status: ItemStatus) {
  const use = await prisma.consumableUse.update({
    where: { id: useId },
    data: { status },
  });

  const allUses = await prisma.consumableUse.findMany({
    where: { entryId: use.entryId },
  });

  const allUsed = allUses.every((u) => u.status === "USED");
  const allWasted = allUses.every((u) => u.status === "WASTED");
  const entryStatus: ItemStatus = allUsed ? "USED" : allWasted ? "WASTED" : "AVAILABLE";

  await prisma.consumableEntry.update({
    where: { id: use.entryId },
    data: { status: entryStatus },
  });

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

// ---- Payment actions ----

export async function createPayment(formData: FormData) {
  const crafterId = formData.get("crafterId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const notes = formData.get("notes") as string;
  const paidAtStr = formData.get("paidAt") as string;

  const paidAt = paidAtStr ? new Date(paidAtStr) : new Date();

  await prisma.payment.create({
    data: {
      crafterId,
      amount,
      notes: notes || null,
      paidAt,
    },
  });

  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/payments");
}
