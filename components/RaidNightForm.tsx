"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRaidNightUsage, createNotePreset, type RaidNightEntry } from "@/lib/actions";

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

const FEAST_OPTIONS = ["Primary Stat", "Secondary Stat"];

const selectClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm";
const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm";

type EntryState = {
  key: number;
  itemType: string;
  itemName: string;
  quantityUsed: number;
  crafterId: string;
  notes: string;
};

function makeEntry(key: number): EntryState {
  return { key, itemType: "FLASK_CAULDRON", itemName: "", quantityUsed: 1, crafterId: "", notes: "" };
}

export function RaidNightForm({
  crafters,
  batches,
  today,
  presets: initialPresets,
}: {
  crafters: Crafter[];
  batches: BatchSummary[];
  today: string;
  presets: NotePreset[];
}) {
  const router = useRouter();
  const [raidDate, setRaidDate] = useState(today);
  const [entries, setEntries] = useState<EntryState[]>([makeEntry(0)]);
  const [nextKey, setNextKey] = useState(1);
  const [presets, setPresets] = useState<NotePreset[]>(initialPresets);
  const [isSubmitting, startSubmit] = useTransition();
  const [isAddingPreset, startAddPreset] = useTransition();
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState("");

  function addEntry() {
    setEntries((prev) => [...prev, makeEntry(nextKey)]);
    setNextKey((k) => k + 1);
  }

  function removeEntry(key: number) {
    setEntries((prev) => prev.filter((e) => e.key !== key));
  }

  function updateEntry(key: number, patch: Partial<EntryState>) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.key !== key) return e;
        const next = { ...e, ...patch };
        // Reset itemName when type changes
        if (patch.itemType !== undefined && patch.itemType !== e.itemType) {
          next.itemName = "";
        }
        return next;
      })
    );
  }

  function getStock(entry: EntryState) {
    const autoName = AUTO_NAMES[entry.itemType];
    const resolvedName = autoName ?? entry.itemName;
    if (!resolvedName) return { available: [], total: 0 };
    const available = batches
      .filter(
        (b) =>
          b.itemType === entry.itemType &&
          (autoName ? b.itemName === autoName : b.itemName === resolvedName)
      )
      .sort((a, b) => new Date(a.craftedAt).getTime() - new Date(b.craftedAt).getTime());
    return { available, total: available.reduce((s, b) => s + b.remaining, 0) };
  }

  function handleSubmit() {
    const toCreate: RaidNightEntry[] = entries.map((e) => {
      const autoName = AUTO_NAMES[e.itemType];
      return {
        itemType: e.itemType,
        itemName: autoName ?? (e.itemName || null),
        quantityUsed: e.quantityUsed,
        crafterId: e.crafterId || null,
        notes: e.notes || null,
      };
    });

    startSubmit(async () => {
      await createRaidNightUsage(raidDate, toCreate);
    });
  }

  function handleAddPreset() {
    const label = newPresetLabel.trim();
    if (!label) return;
    setPresets((prev) => [...prev, { id: `temp-${Date.now()}`, label }]);
    setNewPresetLabel("");
    setShowAddPreset(false);
    startAddPreset(() => createNotePreset(label));
  }

  const canSubmit = entries.length > 0 && entries.every((e) => {
    const autoName = AUTO_NAMES[e.itemType];
    if (autoName) return e.quantityUsed >= 1;
    if (e.itemType === "FEAST") return !!e.itemName && e.quantityUsed >= 1;
    return !!e.itemName && e.quantityUsed >= 1;
  });

  return (
    <div className="space-y-6">
      {/* Date header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Raid Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={raidDate}
          onChange={(e) => setRaidDate(e.target.value)}
          required
          className={`${inputClass} max-w-xs cursor-pointer`}
        />
      </div>

      {/* Entry rows */}
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <EntryRow
            key={entry.key}
            index={idx}
            entry={entry}
            crafters={crafters}
            stock={getStock(entry)}
            presets={presets}
            canRemove={entries.length > 1}
            onUpdate={(patch) => updateEntry(entry.key, patch)}
            onRemove={() => removeEntry(entry.key)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="w-full border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-300 rounded-lg py-3 text-sm transition-colors"
      >
        + Add Item
      </button>

      {/* Note presets manager */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-zinc-600 text-xs">Note presets:</span>
        {presets.map((p) => (
          <span key={p.id} className="px-2 py-0.5 rounded text-xs bg-zinc-800 border border-zinc-700 text-zinc-500">
            {p.label}
          </span>
        ))}
        {showAddPreset ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newPresetLabel}
              onChange={(e) => setNewPresetLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPreset())}
              placeholder="Preset label…"
              autoFocus
              className="bg-zinc-800 border border-zinc-600 rounded px-2 py-0.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 w-32"
            />
            <button
              type="button"
              onClick={handleAddPreset}
              disabled={isAddingPreset || !newPresetLabel.trim()}
              className="text-xs bg-yellow-600 hover:bg-yellow-500 text-zinc-900 font-medium px-2 py-0.5 rounded transition-colors disabled:opacity-50"
            >
              {isAddingPreset ? "…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddPreset(false); setNewPresetLabel(""); }}
              className="text-xs text-zinc-600 hover:text-zinc-400"
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit || !raidDate}
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving…" : `Log ${entries.length} Item${entries.length !== 1 ? "s" : ""}`}
        </button>
        <Link
          href="/usage"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium px-6 py-2 rounded-lg transition-colors border border-zinc-700"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

function EntryRow({
  index,
  entry,
  crafters,
  stock,
  presets,
  canRemove,
  onUpdate,
  onRemove,
}: {
  index: number;
  entry: EntryState;
  crafters: Crafter[];
  stock: { available: BatchSummary[]; total: number };
  presets: NotePreset[];
  canRemove: boolean;
  onUpdate: (patch: Partial<EntryState>) => void;
  onRemove: () => void;
}) {
  const autoName = AUTO_NAMES[entry.itemType];
  const showNameDropdown = entry.itemType === "FEAST";
  const showNameInput = !autoName && entry.itemType !== "FEAST";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-zinc-400 text-sm font-medium">Item {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Type <span className="text-red-400">*</span>
          </label>
          <select
            value={entry.itemType}
            onChange={(e) => onUpdate({ itemType: e.target.value })}
            className={selectClass}
          >
            <option value="FLASK_CAULDRON">Flask Cauldron</option>
            <option value="POTION_CAULDRON">Potion Cauldron</option>
            <option value="FEAST">Feast</option>
            <option value="VANTUS_RUNE">Vantus Rune</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Name — conditional */}
        {autoName ? (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Name</label>
            <div className={`${inputClass} text-zinc-500 cursor-default`}>{autoName}</div>
          </div>
        ) : showNameDropdown ? (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Feast Type <span className="text-red-400">*</span>
            </label>
            <select
              value={entry.itemName}
              onChange={(e) => onUpdate({ itemName: e.target.value })}
              className={selectClass}
            >
              <option value="">Select…</option>
              {FEAST_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={entry.itemName}
              onChange={(e) => onUpdate({ itemName: e.target.value })}
              placeholder="Enter item name"
              className={inputClass}
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Quantity <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={entry.quantityUsed}
            onChange={(e) => onUpdate({ quantityUsed: Math.max(1, parseInt(e.target.value) || 1) })}
            className={inputClass}
          />
        </div>

        {/* Crafter filter */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            From Crafter <span className="text-zinc-600 font-normal">(optional)</span>
          </label>
          <select
            value={entry.crafterId}
            onChange={(e) => onUpdate({ crafterId: e.target.value })}
            className={selectClass}
          >
            <option value="">Any (FIFO)</option>
            {crafters.map((c) => (
              <option key={c.id} value={c.id}>{c.characterName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock info */}
      {(autoName || entry.itemName) && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded px-3 py-2 text-xs">
          {stock.total > 0 ? (
            <span className="text-zinc-400">
              <span className="text-yellow-400 font-medium">{stock.total}</span> available
              {stock.available.length > 1 && (
                <span> across {stock.available.length} batches</span>
              )}
              {stock.available[0] && (
                <span className="text-zinc-600">
                  {" "}· oldest from {stock.available[0].crafter}
                </span>
              )}
            </span>
          ) : (
            <span className="text-zinc-600">No stock available</span>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Notes</label>
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onUpdate({ notes: p.label })}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  entry.notes === p.label
                    ? "bg-yellow-500/20 border-yellow-700 text-yellow-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-200 hover:border-zinc-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={entry.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="e.g. Split 1, prog night…"
          className={inputClass}
        />
      </div>
    </div>
  );
}
