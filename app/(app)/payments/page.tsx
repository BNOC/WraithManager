export const dynamic = "force-dynamic";

import { CrafterPayCard } from "@/components/CrafterPayCard";
import { getPaymentsData } from "@/lib/queries/payments";
import { formatGoldAbbr } from "@/lib/utils/format";

export default async function PaymentsPage() {
  const { crafterStats, grandTotalPaid } = await getPaymentsData();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Payments Log</p>
          <h1 className="text-3xl font-bold text-ink">Payments</h1>
        </div>
        <p className="text-ink-dim text-sm shrink-0 pb-1">
          Paid: <span className="text-green-400 font-semibold">{formatGoldAbbr(grandTotalPaid)}</span>
        </p>
      </div>

      {/* Active crafters */}
      {crafterStats.filter((c) => c.active).map((crafter) => (
        <CrafterPayCard
          key={crafter.id}
          id={crafter.id}
          characterName={crafter.characterName}
          totalOwed={crafter.totalOwed}
          totalPaid={crafter.totalPaid}
          balance={crafter.balance}
          batchRows={crafter.batchRows}
        />
      ))}

      {/* Inactive crafters */}
      {crafterStats.filter((c) => !c.active).length > 0 && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl border border-amber-400/20"
            style={{ background: "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(245,158,11,0.05) 6px, rgba(245,158,11,0.05) 12px)" }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">Inactive Crafters</span>
          </div>
          {crafterStats.filter((c) => !c.active).map((crafter) => (
            <CrafterPayCard
              key={crafter.id}
              id={crafter.id}
              characterName={crafter.characterName}
              totalOwed={crafter.totalOwed}
              totalPaid={crafter.totalPaid}
              balance={crafter.balance}
              batchRows={crafter.batchRows}
            />
          ))}
        </div>
      )}
    </div>
  );
}
