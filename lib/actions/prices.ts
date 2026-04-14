// lib/actions/prices.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";

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
