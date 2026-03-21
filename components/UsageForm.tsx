"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createNotePreset } from "@/lib/actions";

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

interface NotePreset {
  id: string;
  label: string;
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
  presets,
}: {
  crafters: Crafter[];
  batches: BatchSummary[];
  today: string;
  presets: NotePreset[];
}) {
  const [itemType, setItemType] = useState("FLASK_CAULDRON");
  const [itemName, setItemName] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [localPresets, setLocalPresets] = useState<NotePreset[]>(presets);
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [isAddingPreset, startAddPreset] = useTransition();

  const autoName = AUTO_NAMES[itemType];
  const resolvedName = autoName ?? itemName;

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

  function applyPreset(label: string) {
    setNotes(label);
  }

  function handleAddPreset() {
    const label = newPresetLabel.trim();
    if (!label) return;
    const tempId = `temp-${Date.now()}`;
    setLocalPresets((prev) => [...prev, { id: tempId, label }]);
    setNewPresetLabel("");
    setShowAddPreset(false);
    startAddPreset(() => createNotePreset(label));
  }

  return (
    <form
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
          className={`${inputClass} cursor-pointer`}
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

      {/* Notes with presets */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-zinc-300">
            Notes <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
        </div>

        {/* Preset chips */}
        {(localPresets.length > 0 || showAddPreset) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {localPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.label)}
                className="px-2 py-0.5 rounded text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Inline add-preset */}
        <div className="mb-2">
          {showAddPreset ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newPresetLabel}
                onChange={(e) => setNewPresetLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPreset())}
                placeholder="Preset label…"
                autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
              />
              <button
                type="button"
                onClick={handleAddPreset}
                disabled={isAddingPreset || !newPresetLabel.trim()}
                className="text-xs bg-yellow-600 hover:bg-yellow-500 text-zinc-900 font-medium px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {isAddingPreset ? "…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddPreset(false); setNewPresetLabel(""); }}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddPreset(true)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              + add preset
            </button>
          )}
        </div>

        <textarea
          id="notes"
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
