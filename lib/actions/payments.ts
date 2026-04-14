// lib/actions/payments.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateBatchPaidAmount(batchId: string, amount: number) {
  await prisma.craftBatch.update({
    where: { id: batchId },
    data: { paidAmount: amount },
  });
  revalidatePath("/payments");
  revalidatePath("/consumables");
  revalidatePath("/");
}
