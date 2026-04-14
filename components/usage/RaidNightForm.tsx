"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createRaidNightUsage, updateRaidNight, type RaidNightEntry } from "@/lib/actions/usage";
import { DateInput } from "@/components/ui/DateInput";
import { inputClass } from "@/lib/utils/classes";
import {
  RaidNightEntryRow,
  AUTO_NAMES,
  type EntryState,
  type Crafter,
  type BatchSummary,
  type NotePreset,
} from "./RaidNightEntryRow";
import { NotePresetManager } from "./NotePresetManager";

function makeEntry(key: number): EntryState {
  return { key, itemType: "FLASK_CAULDRON", itemName: "", quantityUsed: 1, crafterId: "", notes: "" };
}

export function RaidNightForm({
  crafters,
  batches,
  today,
  presets: initialPresets,
  initialEntries,
  logIdsToDelete,
}: {
  crafters: Crafter[];
  batches: BatchSummary[];
  today: string;
  presets: NotePreset[];
  initialEntries?: EntryState[];
  logIdsToDelete?: string[];
}) {
  const [raidDate, setRaidDate] = useState(today);
  const [entries, setEntries] = useState<EntryState[]>(() => initialEntries ?? [makeEntry(0)]);
  const [nextKey, setNextKey] = useState(() => (initialEntries ? initialEntries.length : 1));
  const [presets, setPresets] = useState<NotePreset[]>(initialPresets);
  const [isSubmitting, startSubmit] = useTransition();

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
    if (!resolvedName) return { available: [], total: 0, crafterTotal: 0, otherTotal: 0 };
    const matchesItem = (b: BatchSummary) =>
      b.itemType === entry.itemType &&
      (autoName ? b.itemName === autoName : b.itemName === resolvedName);
    const available = batches
      .filter(matchesItem)
      .sort((a, b) => new Date(a.craftedAt).getTime() - new Date(b.craftedAt).getTime());
    const crafterBatches = entry.crafterId ? available.filter((b) => b.crafterId === entry.crafterId) : [];
    const crafterTotal = crafterBatches.reduce((s, b) => s + b.remaining, 0);
    const total = available.reduce((s, b) => s + b.remaining, 0);
    const otherTotal = total - crafterTotal;
    return { available, total, crafterTotal, otherTotal };
  }

  function getCrafterStock(crafterId: string, itemType: string, itemName: string) {
    const autoName = AUTO_NAMES[itemType];
    const resolvedName = autoName ?? itemName;
    if (!resolvedName) return 0;
    return batches
      .filter(
        (b) =>
          b.crafterId === crafterId &&
          b.itemType === itemType &&
          (autoName ? b.itemName === autoName : b.itemName === resolvedName)
      )
      .reduce((s, b) => s + b.remaining, 0);
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
      if (logIdsToDelete) {
        await updateRaidNight(logIdsToDelete, raidDate, toCreate);
      } else {
        await createRaidNightUsage(raidDate, toCreate);
      }
    });
  }

  const canSubmit =
    entries.length > 0 &&
    entries.every((e) => {
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
          <RaidNightEntryRow
            key={entry.key}
            index={idx}
            entry={entry}
            crafters={crafters}
            stock={getStock(entry)}
            getCrafterStock={getCrafterStock}
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
      <NotePresetManager presets={presets} onPresetsChange={setPresets} />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit || !raidDate}
          className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving…" : logIdsToDelete ? "Save Changes" : `Log ${entries.length} Item${entries.length !== 1 ? "s" : ""}`}
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
