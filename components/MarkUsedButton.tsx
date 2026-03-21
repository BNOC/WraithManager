"use client";

import { useTransition } from "react";
import { updateEntryStatus } from "@/lib/actions";
import { ItemStatus } from "@prisma/client";

export function MarkUsedButton({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: ItemStatus;
}) {
  const [isPending, startTransition] = useTransition();

  if (currentStatus === "USED") {
    return (
      <button
        onClick={() =>
          startTransition(() => updateEntryStatus(id, "AVAILABLE"))
        }
        disabled={isPending}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Unmark"}
      </button>
    );
  }

  if (currentStatus === "AVAILABLE") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() =>
            startTransition(() => updateEntryStatus(id, "USED"))
          }
          disabled={isPending}
          className="text-xs bg-blue-900/50 text-blue-400 border border-blue-700 px-2 py-0.5 rounded hover:bg-blue-800/50 transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Mark Used"}
        </button>
        <button
          onClick={() =>
            startTransition(() => updateEntryStatus(id, "WASTED"))
          }
          disabled={isPending}
          className="text-xs bg-zinc-700/50 text-zinc-400 border border-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Wasted"}
        </button>
      </div>
    );
  }

  // WASTED
  return (
    <button
      onClick={() =>
        startTransition(() => updateEntryStatus(id, "AVAILABLE"))
      }
      disabled={isPending}
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
    >
      {isPending ? "..." : "Restore"}
    </button>
  );
}
