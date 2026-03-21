import { ItemType } from "@prisma/client";

const typeConfig: Record<ItemType, { label: string; className: string }> = {
  FLASK: {
    label: "Flask",
    className: "bg-purple-900/50 text-purple-300 border border-purple-700",
  },
  POTION: {
    label: "Potion",
    className: "bg-red-900/50 text-red-300 border border-red-700",
  },
  FOOD: {
    label: "Food",
    className: "bg-amber-900/50 text-amber-300 border border-amber-700",
  },
  ENCHANT: {
    label: "Enchant",
    className: "bg-cyan-900/50 text-cyan-300 border border-cyan-700",
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
