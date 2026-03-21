"use client";

import { useTransition } from "react";
import { updateUseStatus } from "@/lib/actions";
import { ItemStatus } from "@prisma/client";

interface Use {
  id: string;
  unitIndex: number;
  status: ItemStatus;
}

const colorMap: Record<ItemStatus, string> = {
  AVAILABLE:
    "bg-zinc-700 hover:bg-green-800 border-zinc-600 text-zinc-300 hover:text-green-200 hover:border-green-600",
  USED: "bg-blue-900/70 hover:bg-blue-800/70 border-blue-700 text-blue-300",
  WASTED: "bg-zinc-800 border-zinc-700 text-zinc-500 line-through",
};

const titleMap: Record<ItemStatus, string> = {
  AVAILABLE: "Available — click to mark used",
  USED: "Used — click to unmark",
  WASTED: "Wasted",
};

function UseUnit({ use }: { use: Use }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next: ItemStatus = use.status === "USED" ? "AVAILABLE" : "USED";
    startTransition(() => updateUseStatus(use.id, next));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || use.status === "WASTED"}
      title={titleMap[use.status]}
      className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors disabled:opacity-50 ${colorMap[use.status]}`}
    >
      {isPending ? "…" : use.unitIndex}
    </button>
  );
}

export function UseTracker({ uses }: { uses: Use[] }) {
  if (uses.length === 0) return null;

  const usedCount = uses.filter((u) => u.status === "USED").length;
  const wastedCount = uses.filter((u) => u.status === "WASTED").length;
  const availableCount = uses.length - usedCount - wastedCount;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {uses.map((use) => (
          <UseUnit key={use.id} use={use} />
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        {usedCount}/{uses.length} used
        {availableCount > 0 && usedCount > 0 && `, ${availableCount} left`}
        {wastedCount > 0 && `, ${wastedCount} wasted`}
      </p>
    </div>
  );
}
