import type { ItemType } from "@prisma/client";

const colorClass: Record<ItemType, string> = {
  FLASK_CAULDRON: "text-violet-300",
  POTION_CAULDRON: "text-rose-300",
  FEAST: "text-blue-300",
  VANTUS_RUNE: "text-emerald-300",
  OTHER: "text-ink-dim",
};

export function ItemTypeIcon({ type, size = 20 }: { type: ItemType; size?: number }) {
  return (
    <span className={`shrink-0 ${colorClass[type]}`}>
      {type === "FLASK_CAULDRON" && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M8 20l-1.5 2.5M16 20l1.5 2.5M12 21v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M5 10c0 5 2.5 9 7 9s7-4 7-9H5z" fill="currentColor" opacity="0.2" />
          <path d="M5 10c0 5 2.5 9 7 9s7-4 7-9H5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M5 10V8a1 1 0 0 1 1-1h1M19 10V8a1 1 0 0 0-1-1h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="10" cy="14" r="1" fill="currentColor" opacity="0.5" />
          <circle cx="13.5" cy="12.5" r="0.8" fill="currentColor" opacity="0.4" />
          <circle cx="11.5" cy="16.5" r="0.7" fill="currentColor" opacity="0.3" />
        </svg>
      )}
      {type === "POTION_CAULDRON" && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="10" y="2" width="4" height="3" rx="1" fill="currentColor" opacity="0.5" />
          <path d="M8 10a6 6 0 1 0 8 0H8z" fill="currentColor" opacity="0.2" />
          <path d="M8 10a6 6 0 1 0 8 0H8z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 5v3M14 5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M8 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9 15a4 4 0 0 0 6 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <circle cx="11" cy="13" r="0.8" fill="currentColor" opacity="0.4" />
        </svg>
      )}
      {type === "FEAST" && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="19" rx="9" ry="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 18c0-4 2-8 4-8s4 4 4 8H8z" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M8 14c-1-1-3-1-3 1s2 2 3 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M16 14c1-1 3-1 3 1s-2 2-3 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M10 8c0-1 1-1 1-2M12 7c0-1 1-1 1-2M14 8c0-1 1-1 1-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        </svg>
      )}
      {type === "VANTUS_RUNE" && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M5 6c0-1.5 1-2.5 2.5-2.5h9C18 3.5 19 4.5 19 6v12c0 1.5-1 2.5-2.5 2.5h-9C6 20.5 5 19.5 5 18V6z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 7v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <path d="M12 9l-2.5-2M12 9l2.5-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
          <path d="M12 13l-2.5 2.5M12 13l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
          <path d="M9.5 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </svg>
      )}
      {type === "OTHER" && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
          <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
        </svg>
      )}
    </span>
  );
}
