"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createCrafter, setCrafterActive } from "@/lib/actions";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export interface CrafterStat {
  id: string;
  name: string;
  active: boolean;
  batchCount: number;
  totalCraftedValue: number;
  totalPaid: number;
  totalOwed: number;
}

interface Props {
  crafters: CrafterStat[];
}

function CrafterCard({ crafter }: { crafter: CrafterStat }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(() => setCrafterActive(crafter.id, !crafter.active));
  }

  return (
    <div className={`bg-surface border rounded-2xl p-4 shadow-lg shadow-black/30 transition-opacity ${crafter.active ? "border-rim" : "border-rim/50 opacity-60"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <Link
              href={`/crafters/${crafter.id}`}
              className="font-bold text-ink text-lg leading-tight truncate hover:text-primary transition-colors"
            >
              {crafter.name}
            </Link>
          {!crafter.active && (
            <span className="text-xs text-ink-faint font-medium uppercase tracking-wider">Inactive</span>
          )}
        </div>
        <div className="flex items-start gap-2 shrink-0 ml-3">
          <div className="text-right">
              <p className={`text-base font-bold leading-tight ${crafter.totalOwed > 0 ? "text-primary" : "text-green-400"}`}>
                {crafter.totalOwed > 0 ? formatGold(crafter.totalOwed) : "✓ Settled"}
              </p>
              {crafter.totalOwed > 0 && (
                <p className="text-ink-faint text-xs">outstanding</p>
              )}
            </div>
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            title={crafter.active ? "Mark as inactive" : "Mark as active"}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
              crafter.active
                ? "border-rim text-ink-faint hover:border-red-500/40 hover:text-red-400"
                : "border-primary/40 text-primary hover:opacity-80"
            }`}
          >
            {pending ? "…" : crafter.active ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs border-t border-rim pt-3">
        <div>
          <p className="text-ink-faint mb-0.5">Batches</p>
          <p className="text-ink font-semibold">{crafter.batchCount}</p>
        </div>
        <div>
          <p className="text-ink-faint mb-0.5">Crafted</p>
          <p className="text-ink font-semibold">{formatGold(crafter.totalCraftedValue)}</p>
        </div>
        <div>
          <p className="text-ink-faint mb-0.5">Paid</p>
          <p className="text-green-400 font-semibold">{formatGold(crafter.totalPaid)}</p>
        </div>
      </div>
    </div>
  );
}

export function CraftersClient({ crafters }: Props) {
  const [formOpen, setFormOpen] = useState(false);

  const active = crafters.filter((c) => c.active);
  const inactive = crafters.filter((c) => !c.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Config</p>
          <h1 className="text-3xl font-bold text-ink">Crafters</h1>
          <p className="text-ink-dim mt-1 text-sm">
            {active.length} active{inactive.length > 0 ? ` · ${inactive.length} inactive` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm"
        >
          {formOpen ? "Cancel" : "+ Add Crafter"}
        </button>
      </div>

      {/* Inline add form */}
      {formOpen && (
        <form
          action={async (fd) => {
            await createCrafter(fd);
            setFormOpen(false);
          }}
          className="bg-surface border border-primary/40 rounded-2xl p-5 shadow-lg shadow-black/30 max-w-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-4">New Crafter</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                placeholder="e.g. BNOC"
                className="w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl transition-opacity w-full text-sm"
            >
              Add Crafter
            </button>
          </div>
        </form>
      )}

      {/* Active crafters */}
      {active.length === 0 && inactive.length === 0 ? (
        <div className="bg-surface border border-rim rounded-2xl p-12 text-center shadow-lg shadow-black/30">
          <p className="text-ink-dim">No crafters yet. Add one above!</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((crafter) => (
                <CrafterCard key={crafter.id} crafter={crafter} />
              ))}
            </div>
          )}

          {inactive.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint mb-3">Inactive</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inactive.map((crafter) => (
                  <CrafterCard key={crafter.id} crafter={crafter} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
