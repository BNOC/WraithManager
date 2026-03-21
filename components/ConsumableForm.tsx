"use client";

import { useState } from "react";
import Link from "next/link";
import { createConsumableEntry } from "@/lib/actions";

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

const selectClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";
const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

export function ConsumableForm({ crafters }: { crafters: Crafter[] }) {
  const [itemType, setItemType] = useState("FLASK_CAULDRON");

  const autoName = AUTO_NAMES[itemType];

  return (
    <form
      action={createConsumableEntry}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5"
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
          onChange={(e) => setItemType(e.target.value)}
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
        /* Auto-named types: hidden input, display-only label */
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
        /* OTHER — free text */
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
            step="0.01"
            placeholder="e.g. 5000"
            className={inputClass}
          />
        </div>
      </div>

      {/* Raid date */}
      <div>
        <label htmlFor="raidDate" className={labelClass}>
          Raid Date{" "}
          <span className="text-zinc-500 font-normal">(optional — Wed/Thu/Mon)</span>
        </label>
        <input
          id="raidDate"
          name="raidDate"
          type="date"
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
          placeholder="Any additional notes..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Save Entry
        </button>
        <Link
          href="/consumables"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium px-6 py-2 rounded-lg transition-colors border border-zinc-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
