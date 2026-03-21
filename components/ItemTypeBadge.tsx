import { ItemType } from "@prisma/client";

const typeConfig: Record<ItemType, { label: string; className: string }> = {
  FLASK_CAULDRON: {
    label: "Flask Cauldron",
    className: "bg-violet-900/50 text-violet-300 border border-violet-700",
  },
  POTION_CAULDRON: {
    label: "Potion Cauldron",
    className: "bg-rose-900/50 text-rose-300 border border-rose-700",
  },
  FEAST: {
    label: "Feast",
    className: "bg-amber-900/50 text-amber-300 border border-amber-700",
  },
  VANTUS_RUNE: {
    label: "Vantus Rune",
    className: "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
  },
  OTHER: {
    label: "Other",
    className: "bg-zinc-700/50 text-zinc-300 border border-zinc-600",
  },
};

export function ItemTypeBadge({ type }: { type: ItemType }) {
  const config = typeConfig[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
