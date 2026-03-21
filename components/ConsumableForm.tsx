"use client";

import { useState } from "react";
import Link from "next/link";
import { createCraftBatch } from "@/lib/actions";

interface Crafter {
  id: string;
  name: string;
  characterName: string;
}

const AUTO_NAMES: Partial<Record<string, string>> = {
  FLASK_CAULDRON: "Flask Cauldron",
  POTION_CAULDRON: "Potion Cauldron",
  VANTUS_RUNE: "Vantus Rune",
};

type DefaultPrices = Partial<Record<string, number>>;

const selectClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
const inputClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
const labelClass = "block text-sm font-medium text-ink-dim mb-1.5";

export function ConsumableForm({
  crafters,
  defaultPrices = {},
  today,
}: {
  crafters: Crafter[];
  defaultPrices?: DefaultPrices;
  today: string; // ISO date string, passed from server to avoid client/server mismatch
}) {
  const [itemType, setItemType] = useState("FLASK_CAULDRON");
  const [costPerUnit, setCostPerUnit] = useState(
    () => defaultPrices["FLASK_CAULDRON"]?.toString() ?? ""
  );

  function handleTypeChange(type: string) {
    setItemType(type);
    const price = defaultPrices[type];
    if (price !== undefined) setCostPerUnit(price.toString());
  }

  const autoName = AUTO_NAMES[itemType];

  return (
    <form
      action={createCraftBatch}
      className="bg-surface border border-rim rounded-2xl p-6 space-y-5 shadow-lg shadow-black/30"
    >
      {/* Type — first */}
      <div>
        <label htmlFor="itemType" className={labelClass}>
          Type <span className="text-red-400">*</span>
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
          <select id="itemName" name="itemName" required className={selectClass}>
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
            placeholder="Enter item name"
            className={inputClass}
          />
        </div>
      )}

      {/* Crafter */}
      <div>
        <label htmlFor="crafterId" className={labelClass}>
          Crafter <span className="text-red-400">*</span>
        </label>
        <select id="crafterId" name="crafterId" required className={selectClass}>
          {crafters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.characterName}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity + Cost per unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className={labelClass}>
            Quantity <span className="text-red-400">*</span>
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            required
            min="1"
            defaultValue="1"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="costPerUnit" className={labelClass}>
            Cost / Unit (gold) <span className="text-red-400">*</span>
          </label>
          <input
            id="costPerUnit"
            name="costPerUnit"
            type="number"
            required
            min="0"
            step="1"
            placeholder="e.g. 5000"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Date crafted */}
      <div>
        <label htmlFor="craftedAt" className={labelClass}>
          Date Crafted <span className="text-red-400">*</span>
        </label>
        <input
          id="craftedAt"
          name="craftedAt"
          type="date"
          required
          defaultValue={today}
          className={`${inputClass} cursor-pointer`}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes <span className="text-ink-faint font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Any additional notes..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity"
        >
          Save Craft
        </button>
        <Link
          href="/consumables"
          className="bg-surface-hi hover:border-primary/40 text-ink font-medium px-6 py-2.5 rounded-xl transition-colors border border-rim"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
