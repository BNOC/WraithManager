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
  searchParams: Promise<{ sort?: string; dir?: string; type?: string }>;
}

export default async function PricesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort ?? "date";
  const dir = params.dir ?? "desc";
  const typeFilter = ALL_TYPES.find((t) => t.value === params.type)?.value ?? null;

  const allConfigs = await prisma.priceConfig.findMany({
    orderBy: { effectiveDate: "desc" },
  });

  // Derive current price per type (first/most-recent entry per type)
  const currentPrices = new Map<ItemType, (typeof allConfigs)[0]>();
  for (const c of allConfigs) {
    if (!currentPrices.has(c.itemType)) currentPrices.set(c.itemType, c);
  }

  // Filter then sort history
  const filtered = typeFilter ? allConfigs.filter((c) => c.itemType === typeFilter) : allConfigs;
  const sorted = [...filtered].sort((a, b) => {
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
    "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  function sortUrl(col: string) {
    const newDir = sort === col && dir === "desc" ? "asc" : "desc";
    const p = new URLSearchParams({ sort: col, dir: newDir });
    if (typeFilter) p.set("type", typeFilter);
    return `/prices?${p.toString()}`;
  }

  function filterUrl(type: string | null) {
    const p = new URLSearchParams({ sort, dir });
    if (type) p.set("type", type);
    return `/prices?${p.toString()}`;
  }

  function filterClass(active: boolean) {
    return active
      ? "px-2.5 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/50"
      : "px-2.5 py-1 rounded-xl text-xs font-medium bg-surface-hi text-ink-dim border border-rim hover:text-ink transition-colors";
  }

  function sortIndicator(col: string) {
    if (sort !== col) return <span className="text-ink-faint ml-1">↕</span>;
    return <span className="text-primary ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Price Config</p>
        <h1 className="text-3xl font-bold text-ink">Prices</h1>
      </div>

      {/* Current prices summary */}
      <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
        <div className="px-4 py-3 border-b border-rim">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Current Defaults
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rim bg-surface/50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Price / Unit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint hidden sm:table-cell">
                Effective From
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint hidden md:table-cell">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {ALL_TYPES.map(({ value, label }) => {
              const config = currentPrices.get(value);
              return (
                <tr key={value} className="border-b border-rim/50">
                  <td className="px-4 py-3">
                    <ItemTypeBadge type={value} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {config ? (
                      <span className="text-primary font-medium">
                        {formatGold(config.price)}
                      </span>
                    ) : (
                      <span className="text-ink-faint italic">not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-dim text-xs hidden sm:table-cell">
                    {config ? formatDate(config.effectiveDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-dim text-xs hidden md:table-cell">
                    {config?.notes ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Set new price form */}
      <div className="bg-surface border border-rim rounded-2xl p-6 shadow-lg shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-4">Set New Price</p>
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
              Notes
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
            className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl transition-opacity"
          >
            Save Price
          </button>
        </form>
      </div>

      {/* Full history — filterable + sortable */}
      {allConfigs.length > 0 && (
        <div className="bg-surface border border-rim rounded-2xl overflow-hidden shadow-lg shadow-black/30">
          <div className="px-4 py-3 border-b border-rim flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Price History
            </p>
            <div className="flex gap-1 flex-wrap">
              <Link href={filterUrl(null)} className={filterClass(!typeFilter)}>All</Link>
              {ALL_TYPES.map(({ value, label }) => (
                <Link key={value} href={filterUrl(value)} className={filterClass(typeFilter === value)}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rim bg-surface/50">
                <th className="text-left px-4 py-3 font-medium">
                  <Link href={sortUrl("type")} className="text-ink-dim hover:text-ink flex items-center gap-1">
                    Type{sortIndicator("type")}
                  </Link>
                </th>
                <th className="text-right px-4 py-3 font-medium">
                  <Link href={sortUrl("price")} className="text-ink-dim hover:text-ink flex items-center justify-end gap-1">
                    Price / Unit{sortIndicator("price")}
                  </Link>
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  <Link href={sortUrl("date")} className="text-ink-dim hover:text-ink flex items-center gap-1">
                    Effective From{sortIndicator("date")}
                  </Link>
                </th>
                <th className="text-left px-4 py-3 text-ink-dim font-medium hidden md:table-cell">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-rim/50 hover:bg-surface-hi/20">
                  <td className="px-4 py-3">
                    <ItemTypeBadge type={c.itemType} />
                    {currentPrices.get(c.itemType)?.id === c.id && (
                      <span className="ml-2 text-xs text-green-500">current</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-primary font-medium">
                    {formatGold(c.price)}
                  </td>
                  <td className="px-4 py-3 text-ink-dim text-xs">
                    {formatDate(c.effectiveDate)}
                  </td>
                  <td className="px-4 py-3 text-ink-dim text-xs hidden md:table-cell">
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
