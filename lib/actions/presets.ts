// lib/actions/presets.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

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
