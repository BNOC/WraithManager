// lib/utils/format.ts

export function formatGold(n: number): string {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export function formatGoldAbbr(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}m`;
  if (n >= 1_000)
    return `${(n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
  return `${Math.round(n)}g`;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
