import { ItemStatus } from "@prisma/client";

const statusConfig: Record<ItemStatus, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-green-900/50 text-green-400 border border-green-700",
  },
  USED: {
    label: "Used",
    className: "bg-blue-900/50 text-blue-400 border border-blue-700",
  },
  WASTED: {
    label: "Wasted",
    className: "bg-zinc-700/50 text-zinc-400 border border-zinc-600",
  },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
