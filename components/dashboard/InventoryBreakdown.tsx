interface Props {
  breakdown: { crafterName: string; remaining: number }[];
  children: React.ReactNode;
  className?: string;
}

export function InventoryBreakdown({ breakdown, children, className }: Props) {
  const visible = breakdown.filter((b) => b.remaining > 0);

  return (
    <div>
      <div className={className ?? ""}>{children}</div>
      {visible.length > 0 && (
        <div className="border-t border-rim/40 px-4 pt-2 pb-3 space-y-1.5">
          {visible.map((b) => (
            <div key={b.crafterName} className="flex items-center justify-between gap-4">
              <span className="text-ink-faint text-xs">{b.crafterName}</span>
              <span className="text-ink-dim font-semibold text-xs">{b.remaining}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
