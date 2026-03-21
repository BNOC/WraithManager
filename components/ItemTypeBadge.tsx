import { ItemType } from "@prisma/client";

const typeConfig: Record<ItemType, { label: string; className: string }> = {
  FLASK_CAULDRON: {
    label: "Flask Cauldron",
    className: "bg-violet-500/10 text-violet-300 border border-violet-500/30",
  },
  POTION_CAULDRON: {
    label: "Potion Cauldron",
    className: "bg-rose-500/10 text-rose-300 border border-rose-500/30",
  },
  FEAST: {
    label: "Feast",
    className: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
  },
  VANTUS_RUNE: {
    label: "Vantus Rune",
    className: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  },
  OTHER: {
    label: "Other",
    className: "bg-surface-hi text-ink-dim border border-rim",
  },
};

export function ItemTypeBadge({ type }: { type: ItemType }) {
  const config = typeConfig[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
