// lib/queries/prices.ts
import prisma from "@/lib/prisma";
import type { ItemType } from "@prisma/client";

export interface PriceConfig {
  id: string;
  itemType: ItemType;
  price: number;
  effectiveDate: Date;
  notes: string | null;
}

export interface PricesData {
  allConfigs: PriceConfig[];
  currentPrices: Map<ItemType, PriceConfig>;
}

export async function getPricesData(): Promise<PricesData> {
  const allConfigs = await prisma.priceConfig.findMany({
    orderBy: { effectiveDate: "desc" },
  });
  const currentPrices = new Map<ItemType, PriceConfig>();
  for (const c of allConfigs) {
    if (!currentPrices.has(c.itemType)) currentPrices.set(c.itemType, c);
  }
  return { allConfigs, currentPrices };
}
