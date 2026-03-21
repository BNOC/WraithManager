export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { createPriceConfig } from "@/lib/actions";
import { ItemTypeBadge } from "@/components/ItemTypeBadge";
import type { ItemType } from "@prisma/client";

const ALL_TYPES: { value: ItemType; label: string }[] = [
  { value: "FLASK_CAULDRON", label: "Flask Cauldron" },
  { value: "POTION_CAULDRON", label: "Potion Cauldron" },
  { value: "FEAST", label: "Feast" },
  { value: "VANTUS_RUNE", label: "Vantus Rune" },
  { value: "OTHER", label: "Other" },
];

const TYPE_ORDER: Record<string, number> = {
  FLASK_CAULDRON: 0,
  POTION_CAULDRON: 1,
  FEAST: 2,
  VANTUS_RUNE: 3,
  OTHER: 4,
};

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface PageProps {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}

export default async function PricesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort ?? "date";
  const dir = params.dir ?? "desc";

  const allConfigs = await prisma.priceConfig.findMany({
    orderBy: { effectiveDate: "desc" },
  });

  // Derive current price per type (first/most-recent entry per type)
  const currentPrices = new Map<ItemType, (typeof allConfigs)[0]>();
  for (const c of allConfigs) {
    if (!currentPrices.has(c.itemType)) currentPrices.set(c.itemType, c);
  }

  // Sort history
  const sorted = [...allConfigs].sort((a, b) => {
    let cmp = 0;
    if (sort === "type") {
      cmp = (TYPE_ORDER[a.itemType] ?? 99) - (TYPE_ORDER[b.itemType] ?? 99);
    } else if (sort === "price") {
      cmp = a.price - b.price;
    } else {
      // date
      cmp = new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime();
    }
    return dir === "asc" ? cmp : -cmp;
  });

  const today = new Date().toISOString().slice(0, 10);

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";
  const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

  function sortUrl(col: string) {
    const newDir = sort === col && dir === "desc" ? "asc" : "desc";
    return `/prices?sort=${col}&dir=${newDir}`;
  }

  function sortIndicator(col: string) {
    if (sort !== col) return <span className="text-zinc-700 ml-1">↕</span>;
    return <span className="text-yellow-400 ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Price Config</h1>
        <p className="text-zinc-400 mt-1">
          Set default material costs per item type. Used to pre-fill the log form and track cost history over the season.
        </p>
      </div>

      {/* Current prices summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            Current Defaults
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Type</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Price / Unit</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                Effective From
              </th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {ALL_TYPES.map(({ value, label }) => {
              const config = currentPrices.get(value);
              return (
                <tr key={value} className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">
                    <ItemTypeBadge type={value} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {config ? (
                      <span className="text-yellow-400 font-medium">
                        {formatGold(config.price)}
                      </span>
                    ) : (
                      <span className="text-zinc-600 italic">not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                    {config ? formatDate(config.effectiveDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell">
                    {config?.notes ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Set new price form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Set New Price</h2>
        <form action={createPriceConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="itemType" className={labelClass}>
                Item Type <span className="text-red-400">*</span>
              </label>
              <select id="itemType" name="itemType" required className={inputClass}>
                {ALL_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="price" className={labelClass}>
                Price / Unit (gold) <span className="text-red-400">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="1"
                placeholder="e.g. 5000"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="effectiveDate" className={labelClass}>
                Effective From <span className="text-red-400">*</span>
              </label>
              <input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                required
                defaultValue={today}
                className={`${inputClass} cursor-pointer`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes{" "}
              <span className="text-zinc-500 font-normal">
                (optional — e.g. "start of season prices")
              </span>
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              placeholder="Reason for this price update..."
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Save Price
          </button>
        </form>
      </div>

      {/* Full history — sortable */}
      {allConfigs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
              Price History
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="text-left px-4 py-3 font-medium">
                  <Link href={sortUrl("type")} className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
                    Type{sortIndicator("type")}
                  </Link>
                </th>
                <th className="text-right px-4 py-3 font-medium">
                  <Link href={sortUrl("price")} className="text-zinc-400 hover:text-zinc-200 flex items-center justify-end gap-1">
                    Price / Unit{sortIndicator("price")}
                  </Link>
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  <Link href={sortUrl("date")} className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
                    Effective From{sortIndicator("date")}
                  </Link>
                </th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-3">
                    <ItemTypeBadge type={c.itemType} />
                    {currentPrices.get(c.itemType)?.id === c.id && (
                      <span className="ml-2 text-xs text-green-500">current</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-400 font-medium">
                    {formatGold(c.price)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {formatDate(c.effectiveDate)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell">
                    {c.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
