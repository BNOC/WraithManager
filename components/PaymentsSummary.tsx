// Reserved for future use — not currently rendered on the payments page.

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export function PaymentsSummary({
  grandOwed,
  grandPaid,
}: {
  grandOwed: number;
  grandPaid: number;
}) {
  const outstanding = grandOwed - grandPaid;
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Total Owed", value: grandOwed, color: "text-primary" },
        { label: "Total Paid", value: grandPaid, color: "text-green-400" },
        { label: "Outstanding", value: outstanding, color: outstanding > 0 ? "text-red-400" : "text-ink-dim" },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-surface border border-rim rounded-2xl px-4 py-3 shadow-lg shadow-black/30">
          <p className="text-ink-faint text-xs mb-1">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{formatGold(value)}</p>
        </div>
      ))}
    </div>
  );
}
