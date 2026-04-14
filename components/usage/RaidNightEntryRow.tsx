"use client";

import { useEffect } from "react";
import { inputClass, selectClass } from "@/lib/utils/classes";

export interface Crafter {
  id: string;
  characterName: string;
  active: boolean;
}

export interface BatchSummary {
  itemType: string;
  itemName: string;
  remaining: number;
  craftedAt: Date;
  crafter: string;
  crafterId: string;
}

export interface NotePreset {
  id: string;
  label: string;
}

export type EntryState = {
  key: number;
  itemType: string;
  itemName: string;
  quantityUsed: number;
  crafterId: string;
  notes: string;
};

export const AUTO_NAMES: Partial<Record<string, string>> = {
  FLASK_CAULDRON: "Flask Cauldron",
  POTION_CAULDRON: "Potion Cauldron",
  VANTUS_RUNE: "Vantus Rune",
};

export const FEAST_OPTIONS = ["Primary Stat", "Secondary Stat"];

export const DEFAULT_NOTE_PRESETS = ["Split 1", "Split 2", "Mains"];

export function RaidNightEntryRow({
  index,
  entry,
  crafters,
  stock,
  getCrafterStock,
  presets,
  canRemove,
  onUpdate,
  onRemove,
}: {
  index: number;
  entry: EntryState;
  crafters: Crafter[];
  stock: { available: BatchSummary[]; total: number; crafterTotal: number; otherTotal: number };
  getCrafterStock: (crafterId: string, itemType: string, itemName: string) => number;
  presets: NotePreset[];
  canRemove: boolean;
  onUpdate: (patch: Partial<EntryState>) => void;
  onRemove: () => void;
}) {
  const autoName = AUTO_NAMES[entry.itemType];
  const showNameDropdown = entry.itemType === "FEAST";
  const showNameInput = !autoName && entry.itemType !== "FEAST";
  const isVantus = entry.itemType === "VANTUS_RUNE";
  const resolvedName = autoName ?? entry.itemName;

  const crafterIdsWithStock = new Set(stock.available.map((b) => b.crafterId));
  const craftersToShow = resolvedName
    ? crafters.filter((c) => (isVantus || c.active) && crafterIdsWithStock.has(c.id))
    : crafters.filter((c) => isVantus || c.active);

  const singleCrafterId = craftersToShow.length === 1 ? craftersToShow[0].id : null;
  useEffect(() => {
    if (singleCrafterId && entry.crafterId !== singleCrafterId) {
      onUpdate({ crafterId: singleCrafterId });
    }
  }, [singleCrafterId]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {craftersToShow.length === 1 ? (
            <div className={`${inputClass} cursor-default flex items-center justify-between`}>
              <span className="text-ink">{craftersToShow[0].characterName}</span>
              <span className="text-ink-faint text-xs">only crafter with stock</span>
            </div>
          ) : (
            <select
              value={entry.crafterId}
              onChange={(e) => onUpdate({ crafterId: e.target.value })}
              className={selectClass}
            >
              <option value="">
                {craftersToShow.length === 0 && resolvedName ? "No crafters with stock" : "Select crafter…"}
              </option>
              {craftersToShow.map((c) => {
                const crafterStock = resolvedName
                  ? getCrafterStock(c.id, entry.itemType, entry.itemName)
                  : null;
                return (
                  <option key={c.id} value={c.id}>
                    {c.characterName}{crafterStock !== null ? ` (${crafterStock} available)` : ""}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      {/* Stock info */}
      {(autoName || entry.itemName) && (
        <div className={`border rounded-xl px-3 py-2 text-xs ${
          entry.crafterId && stock.crafterTotal === 0 && stock.otherTotal > 0
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-surface-hi border-rim/50"
        }`}>
          {entry.crafterId ? (
            stock.crafterTotal > 0 ? (
              <span className="text-ink-dim">
                <span className="text-primary font-medium">{stock.crafterTotal}</span> available from selected crafter
                {stock.otherTotal > 0 && (
                  <span className="text-ink-faint"> · {stock.otherTotal} from others</span>
                )}
              </span>
            ) : stock.otherTotal > 0 ? (
              <span className="text-amber-400">
                Selected crafter has no stock — {stock.otherTotal} available from other crafters
              </span>
            ) : (
              <span className="text-ink-faint">No stock available — will be attributed when craft is logged</span>
            )
          ) : stock.total > 0 ? (
            <span className="text-ink-dim">
              <span className="text-primary font-medium">{stock.total}</span> available across all crafters
            </span>
          ) : (
            <span className="text-ink-faint">No stock available — will be attributed when craft is logged</span>
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
