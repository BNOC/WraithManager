import { ItemType } from "@prisma/client";

const typeConfig: Record<ItemType, { label: string; abbr: string; className: string }> = {
  FLASK_CAULDRON: {
    label: "Flask Cauldron",
    abbr: "FC",
    className: "bg-violet-500/10 text-violet-300 border border-violet-500/30",
  },
  POTION_CAULDRON: {
    label: "Potion Cauldron",
    abbr: "PC",
    className: "bg-rose-500/10 text-rose-300 border border-rose-500/30",
  },
  FEAST: {
    label: "Feast",
    abbr: "F",
    className: "bg-blue-500/10 text-blue-300 border border-blue-500/30",
  },
  VANTUS_RUNE: {
    label: "Vantus Rune",
    abbr: "VR",
    className: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  },
  OTHER: {
    label: "Other",
    abbr: "O",
    className: "bg-surface-hi text-ink-dim border border-rim",
  },
};

export function ItemTypeBadge({ type, small, abbr, label }: { type: ItemType; small?: boolean; abbr?: boolean; label?: string }) {
  const config = typeConfig[type];
  const text = label ?? (abbr ? config.abbr : config.label);
  return (
    <span className={`inline-flex items-center rounded font-medium ${config.className} ${small ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 rounded-lg text-xs"}`}>
      {text}
    </span>
  );
}
