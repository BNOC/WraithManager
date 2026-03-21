"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateUsageLog, deleteUsageLog, type RaidNightEntry } from "@/lib/actions";

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

interface LogData {
  id: string;
  raidDate: string;
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  notes: string | null;
  crafterId: string;
}

export function UsageEditForm({
  log,
  crafters,
  batches,
  presets,
}: {
  log: LogData;
  crafters: Crafter[];
  batches: BatchSummary[];
  presets: NotePreset[];
}) {
  const router = useRouter();
  const [raidDate, setRaidDate] = useState(log.raidDate);
  const [itemType, setItemType] = useState(log.itemType);
  const [itemName, setItemName] = useState(log.itemName ?? "");
  const [quantityUsed, setQuantityUsed] = useState(log.quantityUsed);
  const [crafterId, setCrafterId] = useState(log.crafterId);
  const [notes, setNotes] = useState(log.notes ?? "");
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const autoName = AUTO_NAMES[itemType];
  const showNameDropdown = itemType === "FEAST";
  const showNameInput = !autoName && itemType !== "FEAST";

  function getStock() {
    const resolvedName = autoName ?? itemName;
    if (!resolvedName) return { available: [], total: 0 };
    const available = batches
      .filter(
        (b) =>
          b.itemType === itemType &&
          (autoName ? b.itemName === autoName : b.itemName === resolvedName)
      )
      .sort((a, b) => new Date(a.craftedAt).getTime() - new Date(b.craftedAt).getTime());
    return { available, total: available.reduce((s, b) => s + b.remaining, 0) };
  }

  const stock = getStock();

  function handleSave() {
    const entry: RaidNightEntry = {
      itemType,
      itemName: autoName ?? (itemName || null),
      quantityUsed,
      crafterId: crafterId || null,
      notes: notes || null,
    };
    startSave(async () => {
      await updateUsageLog(log.id, raidDate, entry);
    });
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteUsageLog(log.id);
      router.push("/usage");
    });
  }

  const canSave =
    raidDate &&
    quantityUsed >= 1 &&
    (autoName || (itemType === "FEAST" ? !!itemName : !!itemName));

  const allPresetLabels = [
    ...DEFAULT_NOTE_PRESETS,
    ...presets.map((p) => p.label).filter((l) => !DEFAULT_NOTE_PRESETS.includes(l)),
  ];

  return (
    <div className="space-y-5">
      {/* Raid date */}
      <div className="bg-surface border border-rim rounded-2xl p-5">
        <label className="block text-sm font-medium text-ink-dim mb-1.5">
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

      {/* Item fields */}
      <div className="bg-surface border border-rim rounded-2xl p-5 space-y-4 shadow-lg shadow-black/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1">
              Type <span className="text-red-400">*</span>
            </label>
            <select
              value={itemType}
              onChange={(e) => {
                setItemType(e.target.value);
                setItemName("");
              }}
              className={selectClass}
            >
              <option value="FLASK_CAULDRON">Flask Cauldron</option>
              <option value="POTION_CAULDRON">Potion Cauldron</option>
              <option value="FEAST">Feast</option>
              <option value="VANTUS_RUNE">Vantus Rune</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Name */}
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
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className={selectClass}
              >
                <option value="">Select…</option>
                {FEAST_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ) : showNameInput ? (
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                className={inputClass}
              />
            </div>
          ) : null}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantityUsed}
              onChange={(e) => setQuantityUsed(Math.max(1, parseInt(e.target.value) || 1))}
              className={inputClass}
            />
          </div>

          {/* Crafter */}
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1">
              Crafter <span className="text-red-400">*</span>
            </label>
            <select
              value={crafterId}
              onChange={(e) => setCrafterId(e.target.value)}
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
        {(autoName || itemName) && (
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
          <label className="block text-xs font-medium text-ink-dim mb-1">Notes</label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {allPresetLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setNotes(notes === label ? "" : label)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  notes === label
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Split 1, prog night…"
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !canSave}
            className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
          <Link
            href="/usage"
            className="bg-surface-hi hover:border-primary/40 text-ink font-medium px-6 py-2.5 rounded-xl transition-colors border border-rim"
          >
            Cancel
          </Link>
        </div>

        {/* Delete */}
        <div>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-dim">Delete this entry?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-ink-faint hover:text-ink-dim transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-ink-faint hover:text-red-400 transition-colors"
            >
              Delete entry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
