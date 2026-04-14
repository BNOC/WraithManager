export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { CraftEditForm } from "@/components/crafters/CraftEditForm";

export default async function EditCraftPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const user = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (user?.toLowerCase() !== "bnoc") redirect("/consumables");

  const { id } = await params;

  const [batch, crafters] = await Promise.all([
    prisma.craftBatch.findUnique({
      where: { id },
      include: { usageLines: { select: { quantity: true } } },
    }),
    prisma.crafter.findMany({ orderBy: { characterName: "asc" } }),
  ]);

  if (!batch) notFound();

  const usedQty = batch.usageLines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Edit</p>
        <h1 className="text-3xl font-bold text-ink">Edit Craft</h1>
      </div>
      <CraftEditForm
        batch={{
          id: batch.id,
          crafterId: batch.crafterId,
          itemType: batch.itemType,
          itemName: batch.itemName,
          quantity: batch.quantity,
          costPerUnit: batch.costPerUnit,
          craftedAt: batch.craftedAt.toISOString().slice(0, 10),
          notes: batch.notes ?? "",
          usedQty,
        }}
        crafters={crafters.map((c) => ({ id: c.id, characterName: c.characterName }))}
      />
    </div>
  );
}
