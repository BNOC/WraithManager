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

  await prisma.consumableEntry.create({
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

  revalidatePath("/consumables");
  revalidatePath("/");
  redirect("/consumables");
}

export async function updateEntryStatus(id: string, status: ItemStatus) {
  await prisma.consumableEntry.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/consumables");
  revalidatePath("/");
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
