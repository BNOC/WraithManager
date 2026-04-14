export function PaymentBadge({
  paidAmount,
  owedAmount,
  status,
}: {
  paidAmount: number;
  owedAmount: number;
  status: string;
}) {
  if (owedAmount === 0) return <span className="text-ink-faint text-xs">Nothing owed</span>;
  if (status === "paid")
    return (
      <span className="text-xs text-green-400 font-medium">✓ Paid</span>
    );
  if (status === "partial")
    return (
      <span className="text-xs text-amber-400">
        Part-paid ({Math.round((paidAmount / owedAmount) * 100)}%)
      </span>
    );
  return <span className="text-xs text-ink-dim">Unpaid</span>;
}
