import prisma from "@/lib/prisma";
import { ItemTypeIcon } from "@/components/ItemTypeIcon";
import type { ItemType } from "@prisma/client";

const TYPES: { key: ItemType; label: string }[] = [
  { key: "FLASK_CAULDRON",  label: "Flasks"   },
  { key: "POTION_CAULDRON", label: "Potions"  },
  { key: "FEAST",           label: "Feasts"   },
  { key: "VANTUS_RUNE",     label: "Vantus"   },
  { key: "OTHER",           label: "Other"    },
];

export async function GuildSuppliesWidget() {
  const rows = await prisma.usageLog.groupBy({
    by: ["itemType"],
    _sum: { quantityUsed: true },
  });

  const totals: Partial<Record<ItemType, number>> = {};
  for (const r of rows) totals[r.itemType as ItemType] = r._sum.quantityUsed ?? 0;

  const visible = TYPES.filter((t) => (totals[t.key] ?? 0) > 0);
  if (visible.length === 0) return null;

  const grand = visible.reduce((s, t) => s + (totals[t.key] ?? 0), 0);

  return (
    <div
      className="mx-3 mb-3 rounded-xl border border-primary/25 relative overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >

      {/* Top accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative px-3 pt-2.5 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
            All Time Usage
          </span>
          <span className="text-[10px] font-bold tabular-nums text-primary/50">
            ×{grand.toLocaleString()}
          </span>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {visible.map((t) => {
            const count = totals[t.key] ?? 0;
            const pct = grand > 0 ? (count / grand) * 100 : 0;
            return (
              <div key={t.key}>
                <div className="flex items-center gap-2 mb-0.5">
                  <ItemTypeIcon type={t.key} size={13} />
                  <span className="flex-1 text-[11px] text-ink-dim leading-none">{t.label}</span>
                  <span className="text-[11px] font-bold text-ink tabular-nums leading-none">
                    ×{count.toLocaleString()}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-px rounded-full bg-primary/10 overflow-hidden ml-4.75">
                  <div
                    className="h-full rounded-full bg-primary/40 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
