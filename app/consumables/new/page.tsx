export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { ConsumableForm } from "@/components/ConsumableForm";

export default async function NewConsumablePage() {
  const [crafters, allPrices] = await Promise.all([
    prisma.crafter.findMany({ orderBy: { characterName: "asc" } }),
    prisma.priceConfig.findMany({ orderBy: { effectiveDate: "desc" } }),
  ]);

  const defaultPrices: Record<string, number> = {};
  for (const p of allPrices) {
    if (!(p.itemType in defaultPrices)) defaultPrices[p.itemType] = p.price;
  }

  const today = new Date().toISOString().slice(0, 10);

  if (crafters.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">No Crafters Found</h2>
          <p className="text-zinc-400 mb-4">
            You need to add at least one crafter before logging crafts.
          </p>
          <Link
            href="/crafters"
            className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm inline-block"
          >
            Add Crafters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Log Craft</h1>
        <p className="text-zinc-400 mt-1">Record a crafting session</p>
      </div>
      <ConsumableForm crafters={crafters} defaultPrices={defaultPrices} today={today} />
    </div>
  );
}
