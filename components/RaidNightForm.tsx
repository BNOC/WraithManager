"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRaidNightUsage, createNotePreset, updateNotePreset, deleteNotePreset, type RaidNightEntry } from "@/lib/actions";
import { DateInput } from "@/components/DateInput";

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

const DEFAULT_NOTE_PRESETS = ["Split 1", "Split 2", "Mains"];

const selectClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";
const inputClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";

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
  const [showManagePresets, setShowManagePresets] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetLabel, setEditingPresetLabel] = useState("");
  const [, startMutatePreset] = useTransition();

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
    const hasName = autoName ? true : !!e.itemName;
    return hasName && e.quantityUsed >= 1 && !!e.crafterId && !!e.notes.trim();
  });

  return (
    <div className="space-y-6">
      {/* Date header */}
      <div className="bg-surface border border-rim rounded-2xl p-5">
        <label className="block text-sm font-medium text-ink-dim mb-1.5">
          Raid Date <span className="text-red-400">*</span>
        </label>
        <DateInput
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
        className="w-full border border-dashed border-rim hover:border-ink-dim text-ink-faint hover:text-ink-dim rounded-xl py-3 text-sm transition-colors"
      >
        + Add Item
      </button>

      {/* Note presets manager */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-ink-faint text-xs">Custom note presets:</span>
          {presets.map((p) => (
            <span key={p.id} className="px-2 py-0.5 rounded-lg text-xs bg-surface-hi border border-rim text-ink-dim">
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
                className="bg-surface-hi border border-rim rounded-lg px-2 py-0.5 text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-primary w-32"
              />
              <button
                type="button"
                onClick={handleAddPreset}
                disabled={isAddingPreset || !newPresetLabel.trim()}
                className="text-xs bg-primary hover:opacity-90 text-white font-medium px-2 py-0.5 rounded-lg transition-opacity disabled:opacity-50"
              >
                {isAddingPreset ? "…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddPreset(false); setNewPresetLabel(""); }}
                className="text-xs text-ink-faint hover:text-ink-dim"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddPreset(true)}
              className="text-xs text-ink-faint hover:text-ink-dim transition-colors"
            >
              + add
            </button>
          )}
          {presets.length > 0 && !showAddPreset && (
            <button
              type="button"
              onClick={() => { setShowManagePresets((v) => !v); setEditingPresetId(null); }}
              className="text-xs text-ink-faint hover:text-ink-dim transition-colors ml-1"
            >
              {showManagePresets ? "▲ hide" : "✎ manage"}
            </button>
          )}
        </div>

        {showManagePresets && presets.length > 0 && (
          <div className="bg-surface border border-rim rounded-xl divide-y divide-rim overflow-hidden">
            {presets.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2">
                {editingPresetId === p.id ? (
                  <>
                    <input
                      type="text"
                      value={editingPresetLabel}
                      onChange={(e) => setEditingPresetLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const label = editingPresetLabel.trim();
                          if (!label) return;
                          setPresets((prev) => prev.map((x) => x.id === p.id ? { ...x, label } : x));
                          setEditingPresetId(null);
                          startMutatePreset(() => updateNotePreset(p.id, label));
                        } else if (e.key === "Escape") {
                          setEditingPresetId(null);
                        }
                      }}
                      autoFocus
                      className="flex-1 bg-surface-hi border border-rim rounded-lg px-2 py-0.5 text-xs text-ink focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const label = editingPresetLabel.trim();
                        if (!label) return;
                        setPresets((prev) => prev.map((x) => x.id === p.id ? { ...x, label } : x));
                        setEditingPresetId(null);
                        startMutatePreset(() => updateNotePreset(p.id, label));
                      }}
                      className="text-xs text-primary hover:opacity-80 font-medium transition-opacity"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPresetId(null)}
                      className="text-xs text-ink-faint hover:text-ink-dim transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs text-ink">{p.label}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingPresetId(p.id); setEditingPresetLabel(p.label); }}
                      className="text-xs text-ink-faint hover:text-ink transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPresets((prev) => prev.filter((x) => x.id !== p.id));
                        startMutatePreset(() => deleteNotePreset(p.id));
                      }}
                      className="text-xs text-ink-faint hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit || !raidDate}
          className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving…" : `Log ${entries.length} Item${entries.length !== 1 ? "s" : ""}`}
        </button>
        <Link
          href="/usage"
          className="bg-surface-hi hover:border-primary/40 text-ink font-medium px-6 py-2.5 rounded-xl transition-colors border border-rim"
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
    <div className="bg-surface border border-rim rounded-2xl p-5 space-y-4 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-1">
        <span className="text-ink-dim text-sm font-medium">Item {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-ink-faint hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-ink-dim mb-1">
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
            <label className="block text-xs font-medium text-ink-dim mb-1">Name</label>
            <div className={`${inputClass} text-ink-dim cursor-default`}>{autoName}</div>
          </div>
        ) : showNameDropdown ? (
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1">
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
            <label className="block text-xs font-medium text-ink-dim mb-1">
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
          <label className="block text-xs font-medium text-ink-dim mb-1">
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

        {/* Crafter */}
        <div>
          <label className="block text-xs font-medium text-ink-dim mb-1">
            Crafter <span className="text-red-400">*</span>
          </label>
          <select
            value={entry.crafterId}
            onChange={(e) => onUpdate({ crafterId: e.target.value })}
            className={selectClass}
          >
            <option value="">Select crafter…</option>
            {crafters.map((c) => (
              <option key={c.id} value={c.id}>{c.characterName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock info */}
      {(autoName || entry.itemName) && (
        <div className="bg-surface-hi border border-rim/50 rounded-xl px-3 py-2 text-xs">
          {stock.total > 0 ? (
            <span className="text-ink-dim">
              <span className="text-primary font-medium">{stock.total}</span> available
              {stock.available.length > 1 && (
                <span> across {stock.available.length} batches</span>
              )}
              {stock.available[0] && (
                <span className="text-ink-faint">
                  {" "}· oldest from {stock.available[0].crafter}
                </span>
              )}
            </span>
          ) : (
            <span className="text-ink-faint">No stock available</span>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-ink-dim mb-1">Notes <span className="text-red-400">*</span></label>
        <div className="flex flex-wrap gap-1 mb-1.5">
            {[...DEFAULT_NOTE_PRESETS, ...presets.map((p) => p.label).filter((l) => !DEFAULT_NOTE_PRESETS.includes(l))].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onUpdate({ notes: entry.notes === label ? "" : label })}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  entry.notes === label
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : "bg-surface-hi border-rim text-ink-faint hover:text-ink hover:border-ink-faint"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
