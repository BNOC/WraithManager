export const dynamic = "force-dynamic";

import Link from "next/link";
import { UsageNightCard } from "@/components/usage/UsageNightCard";
import { MissingNightRow } from "@/components/usage/MissingNightRow";
import type { UsageNightCardProps } from "@/lib/queries/usage";
import { getUsagePageData } from "@/lib/queries/usage";
import { formatGold } from "@/lib/utils/format";

export default async function UsagePage() {
  const { totalUsed, totalValue, nightCount, nightCards, missingKeys } = await getUsagePageData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-1">Usage Log</p>
          <h1 className="text-3xl font-bold text-ink">Usage</h1>
          <p className="text-ink-dim mt-1 text-sm">
            {nightCount} raid night{nightCount !== 1 ? "s" : ""} · {totalUsed} items used · {formatGold(totalValue)} total spent
          </p>
        </div>
        <Link
          href="/usage/new"
          className="bg-primary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-opacity text-sm shrink-0"
        >
          + Log Raid Night
        </Link>
      </div>

      {nightCount === 0 ? (
        <div className="bg-surface border border-rim rounded-2xl p-12 text-center shadow-lg shadow-black/30">
          <p className="text-ink-dim text-lg">No usage logged yet.</p>
          <Link href="/usage/new" className="mt-4 inline-block text-primary hover:opacity-80">
            Log first raid night →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            // Merge logged and missing into one desc-sorted list
            const allKeys = [...new Set([...nightCards.map((c) => c.dateKey), ...missingKeys])]
              .sort((a, b) => b.localeCompare(a));

            const cardMap = new Map(nightCards.map((c) => [c.dateKey, c]));
            let loggedCount = 0;

            return allKeys.map((dateKey) => {
              const card = cardMap.get(dateKey);
              if (card) {
                const isFirst = loggedCount === 0;
                loggedCount++;
                return <UsageNightCard key={dateKey} {...card} defaultOpen={isFirst} />;
              }
              return <MissingNightRow key={dateKey} dateKey={dateKey} />;
            });
          })()}
        </div>
      )}
    </div>
  );
}
