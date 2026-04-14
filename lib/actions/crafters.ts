// lib/actions/crafters.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireBnoc } from "./_guard";

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
