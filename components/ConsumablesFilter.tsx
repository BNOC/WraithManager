"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "FLASK_CAULDRON", label: "Flask Cauldron" },
  { value: "POTION_CAULDRON", label: "Potion Cauldron" },
  { value: "FEAST", label: "Feast" },
  { value: "VANTUS_RUNE", label: "Vantus Rune" },
  { value: "OTHER", label: "Other" },
];

interface Crafter {
  id: string;
  name: string;
}

interface Props {
  crafters: Crafter[];
  activeCrafter: string;
  activeType: string;
}

function buildUrl(crafter: string, type: string) {
  const p = new URLSearchParams();
  if (crafter) p.set("crafter", crafter);
  if (type) p.set("type", type);
  const qs = p.toString();
  return `/consumables${qs ? `?${qs}` : ""}`;
}

export function ConsumablesFilter({ crafters, activeCrafter, activeType }: Props) {
  const [open, setOpen] = useState(false);
  const [crafter, setCrafter] = useState(activeCrafter);
  const [type, setType] = useState(activeType);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const activeCount = (activeCrafter ? 1 : 0) + (activeType ? 1 : 0);

  function apply(newCrafter: string, newType: string) {
    setCrafter(newCrafter);
    setType(newType);
    setOpen(false);
    startTransition(() => {
      router.push(buildUrl(newCrafter, newType));
    });
  }

  function reset() {
    apply("", "");
  }

  const activeTypeName = TYPE_OPTIONS.find((o) => o.value === activeType)?.label;
  const activeCrafterName = crafters.find((c) => c.id === activeCrafter)?.name;

  return (
    <>
      {/* Filter button */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
            activeCount > 0
              ? "bg-primary/10 border-primary/40 text-primary"
              : "bg-surface-hi border-rim text-ink-dim hover:text-ink"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Filter
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {/* Active filter pills */}
        {activeCrafterName && (
          <button
            type="button"
            onClick={() => apply("", type)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            {activeCrafterName}
            <span className="opacity-60">×</span>
          </button>
        )}
        {activeTypeName && activeType && (
          <button
            type="button"
            onClick={() => apply(crafter, "")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            {activeTypeName}
            <span className="opacity-60">×</span>
          </button>
        )}
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer — slides up from bottom on mobile, anchored panel on desktop */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out
          bottom-0 left-0 right-0 md:bottom-auto md:top-auto md:left-auto md:right-auto
          md:absolute md:top-full md:mt-2
          ${open ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full md:translate-y-2 opacity-0 pointer-events-none"}
        `}
      >
        <div className="bg-surface border border-rim rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden w-full md:w-80">
          {/* Handle (mobile) */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-rim" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-rim">
            <span className="text-sm font-semibold text-ink">Filter Crafts</span>
            <div className="flex items-center gap-3">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-ink-dim hover:text-ink transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-ink-faint hover:text-ink transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Crafter section */}
          <div className="px-4 py-3 border-b border-rim/60">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-2">Crafter</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={!crafter} onClick={() => apply("", type)}>All</FilterChip>
              {crafters.map((c) => (
                <FilterChip key={c.id} active={crafter === c.id} onClick={() => apply(c.id, type)}>
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Type section */}
          <div className="px-4 py-3 pb-safe">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-2">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.label}
                  active={type === opt.value}
                  onClick={() => apply(crafter, opt.value)}
                >
                  {opt.label}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Safe area spacer on mobile */}
          <div className="md:hidden h-4" />
        </div>
      </div>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-surface-hi border border-rim text-ink-dim hover:text-ink hover:border-primary/30"
      }`}
    >
      {children}
    </button>
  );
}
