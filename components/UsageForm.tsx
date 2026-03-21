"use client";

import { useState } from "react";
import Link from "next/link";
import { createUsageLog } from "@/lib/actions";

interface Crafter {
  id: string;
  characterName: string;
}

interface BatchSummary {
  itemType: string;
  itemName: string;
  remaining: number;
  craftedAt: Date;
  crafter: string;
}

const AUTO_NAMES: Partial<Record<string, string>> = {
  FLASK_CAULDRON: "Flask Cauldron",
  POTION_CAULDRON: "Potion Cauldron",
  VANTUS_RUNE: "Vantus Rune",
};

const selectClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";
const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

export function UsageForm({
  crafters,
  batches,
  today,
}: {
  crafters: Crafter[];
  batches: BatchSummary[];
  today: string;
}) {
  const [itemType, setItemType] = useState("FLASK_CAULDRON");
  const [itemName, setItemName] = useState<string>("");

  const autoName = AUTO_NAMES[itemType];
  const resolvedName = autoName ?? itemName;

  // Available stock for this type+name
  const available = batches
    .filter(
      (b) =>
        b.itemType === itemType &&
        (autoName ? true : b.itemName === resolvedName)
    )
    .sort((a, b) => new Date(a.craftedAt).getTime() - new Date(b.craftedAt).getTime());

  const totalAvailable = available.reduce((s, b) => s + b.remaining, 0);

  function handleTypeChange(type: string) {
    setItemType(type);
    setItemName("");
  }

  return (
    <form
      action={createUsageLog}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5"
    >
      {/* Raid date */}
      <div>
        <label htmlFor="raidDate" className={labelClass}>
          Raid Date <span className="text-red-400">*</span>
        </label>
        <input
          id="raidDate"
          name="raidDate"
          type="date"
          required
          defaultValue={today}
          className={inputClass}
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="itemType" className={labelClass}>
          Item Type <span className="text-red-400">*</span>
        </label>
        <select
          id="itemType"
          name="itemType"
          required
          value={itemType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className={selectClass}
        >
          <option value="FLASK_CAULDRON">Flask Cauldron</option>
          <option value="POTION_CAULDRON">Potion Cauldron</option>
          <option value="FEAST">Feast</option>
          <option value="VANTUS_RUNE">Vantus Rune</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Item name — conditional */}
      {autoName ? (
        <input type="hidden" name="itemName" value={autoName} />
      ) : itemType === "FEAST" ? (
        <div>
          <label htmlFor="itemName" className={labelClass}>
            Feast Type <span className="text-red-400">*</span>
          </label>
          <select
            id="itemName"
            name="itemName"
            required
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className={selectClass}
          >
            <option value="">Select…</option>
            <option value="Primary Stat">Primary Stat</option>
            <option value="Secondary Stat">Secondary Stat</option>
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="itemName" className={labelClass}>
            Item Name <span className="text-red-400">*</span>
          </label>
          <input
            id="itemName"
            name="itemName"
            type="text"
            required
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
            className={inputClass}
          />
        </div>
      )}

      {/* Crafter filter (optional) */}
      <div>
        <label htmlFor="crafterId" className={labelClass}>
          From Crafter{" "}
          <span className="text-zinc-500 font-normal">(optional — leave blank for any)</span>
        </label>
        <select id="crafterId" name="crafterId" className={selectClass}>
          <option value="">Any (FIFO across all crafters)</option>
          {crafters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.characterName}
            </option>
          ))}
        </select>
      </div>

      {/* Available stock info */}
      {(autoName || itemName) && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm">
          {totalAvailable > 0 ? (
            <div className="space-y-1">
              <p className="text-zinc-300">
                <span className="text-yellow-400 font-medium">{totalAvailable}</span>{" "}
                available across {available.length} batch{available.length !== 1 ? "es" : ""} (FIFO order):
              </p>
              {available.map((b, i) => (
                <p key={i} className="text-zinc-500 text-xs ml-2">
                  · {b.remaining} from {b.crafter} (crafted{" "}
                  {new Date(b.craftedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  )
                </p>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No stock available for this item.</p>
          )}
        </div>
      )}

      {/* Quantity used */}
      <div>
        <label htmlFor="quantityUsed" className={labelClass}>
          Quantity Used <span className="text-red-400">*</span>
        </label>
        <input
          id="quantityUsed"
          name="quantityUsed"
          type="number"
          required
          min="1"
          defaultValue="1"
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="e.g. prog night, wipe recovery..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Log Usage
        </button>
        <Link
          href="/usage"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium px-6 py-2 rounded-lg transition-colors border border-zinc-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
