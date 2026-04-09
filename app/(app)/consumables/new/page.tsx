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
        <div className="bg-surface border border-rim rounded-2xl p-8 text-center shadow-lg shadow-black/30">
          <h2 className="text-xl font-semibold text-ink mb-2">No Crafters Found</h2>
          <p className="text-ink-dim mb-4">
            You need to add at least one crafter before logging crafts.
          </p>
          <Link
            href="/crafters"
            className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm inline-block"
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
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Craft Log</p>
        <h1 className="text-3xl font-bold text-ink">Log Craft</h1>
      </div>
      <ConsumableForm crafters={crafters} defaultPrices={defaultPrices} today={today} />
    </div>
  );
}
