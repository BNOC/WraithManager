"use client";

import { useState, useTransition } from "react";
import { createNotePreset, updateNotePreset, deleteNotePreset } from "@/lib/actions/presets";
import type { NotePreset } from "./RaidNightEntryRow";

export function NotePresetManager({
  presets,
  onPresetsChange,
}: {
  presets: NotePreset[];
  onPresetsChange: (presets: NotePreset[]) => void;
}) {
  const [isAddingPreset, startAddPreset] = useTransition();
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [showManagePresets, setShowManagePresets] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetLabel, setEditingPresetLabel] = useState("");
  const [, startMutatePreset] = useTransition();

  function handleAddPreset() {
    const label = newPresetLabel.trim();
    if (!label) return;
    onPresetsChange([...presets, { id: `temp-${Date.now()}`, label }]);
    setNewPresetLabel("");
    setShowAddPreset(false);
    startAddPreset(() => createNotePreset(label));
  }

  return (
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
                        onPresetsChange(presets.map((x) => x.id === p.id ? { ...x, label } : x));
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
                      onPresetsChange(presets.map((x) => x.id === p.id ? { ...x, label } : x));
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
                      onPresetsChange(presets.filter((x) => x.id !== p.id));
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
  );
}
