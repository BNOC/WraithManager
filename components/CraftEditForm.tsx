"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateCraftBatch, deleteCraftBatch } from "@/lib/actions";
import { DateInput } from "@/components/DateInput";
import { useState } from "react";

interface Props {
  batch: {
    id: string;
    crafterId: string;
    itemType: string;
    itemName: string;
    quantity: number;
    costPerUnit: number;
    craftedAt: string;
    notes: string;
    usedQty: number;
  };
  crafters: { id: string; characterName: string }[];
}

const AUTO_NAMES: Partial<Record<string, string>> = {
  FLASK_CAULDRON: "Flask Cauldron",
  POTION_CAULDRON: "Potion Cauldron",
  VANTUS_RUNE: "Vantus Rune",
};

const selectClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
const inputClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
const labelClass = "block text-sm font-medium text-ink-dim mb-1.5";

export function CraftEditForm({ batch, crafters }: Props) {
  const [itemType, setItemType] = useState(batch.itemType);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const autoName = AUTO_NAMES[itemType];

  function handleDelete() {
    startTransition(() => deleteCraftBatch(batch.id));
  }

  return (
    <div className="space-y-4">
      <form
        action={(fd) => startTransition(() => updateCraftBatch(batch.id, fd))}
        className="bg-surface border border-rim rounded-2xl p-6 space-y-5 shadow-lg shadow-black/30"
      >
        {/* Type */}
        <div>
          <label htmlFor="itemType" className={labelClass}>Type</label>
          <select
            id="itemType"
            name="itemType"
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

        {/* Item name */}
        {autoName ? (
          <input type="hidden" name="itemName" value={autoName} />
        ) : itemType === "FEAST" ? (
          <div>
            <label htmlFor="itemName" className={labelClass}>Feast Type</label>
            <select id="itemName" name="itemName" defaultValue={batch.itemName} className={selectClass}>
              <option value="Primary Stat">Primary Stat</option>
              <option value="Secondary Stat">Secondary Stat</option>
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="itemName" className={labelClass}>Item Name</label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              required
              defaultValue={batch.itemName}
              className={inputClass}
            />
          </div>
        )}

        {/* Crafter */}
        <div>
          <label htmlFor="crafterId" className={labelClass}>Crafter</label>
          <select id="crafterId" name="crafterId" defaultValue={batch.crafterId} className={selectClass}>
            {crafters.map((c) => (
              <option key={c.id} value={c.id}>{c.characterName}</option>
            ))}
          </select>
        </div>

        {/* Quantity + Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className={labelClass}>Quantity</label>
            {batch.usedQty > 0 && (
              <p className="text-[11px] text-amber-400/80 mb-1">{batch.usedQty} already used — min {batch.usedQty}</p>
            )}
            <input
              id="quantity"
              name="quantity"
              type="number"
              required
              min={batch.usedQty > 0 ? batch.usedQty : 1}
              defaultValue={batch.quantity}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="costPerUnit" className={labelClass}>Cost / Unit (gold)</label>
            <input
              id="costPerUnit"
              name="costPerUnit"
              type="number"
              required
              min="0"
              step="1"
              defaultValue={batch.costPerUnit}
              className={inputClass}
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="craftedAt" className={labelClass}>Date Crafted</label>
          <DateInput
            id="craftedAt"
            name="craftedAt"
            required
            defaultValue={batch.craftedAt}
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
            defaultValue={batch.notes}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save Changes"}
          </button>
          <Link
            href="/consumables"
            className="bg-surface-hi hover:border-primary/40 text-ink font-medium px-6 py-2.5 rounded-xl transition-colors border border-rim"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Delete zone */}
      <div className="bg-surface border border-red-900/40 rounded-2xl px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400/70 mb-3">Danger Zone</p>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-ink-dim flex-1">This will remove the batch and all its attribution lines. Are you sure?</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm bg-red-900/60 text-red-300 border border-red-700/60 px-4 py-1.5 rounded-xl hover:bg-red-800/60 transition-colors disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-ink-faint hover:text-ink-dim transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-400/70 hover:text-red-400 transition-colors"
          >
            Delete this batch…
          </button>
        )}
      </div>
    </div>
  );
}
