// components/ui/icons.tsx
// Nav icons extracted from SideNav

export function WraithIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="text-primary shrink-0">
      {/* Body: dome top, wavy bottom */}
      <path d="M8 1C4.69 1 2 3.69 2 7v6.5l1.5-1.25 1.5 1.25 1.5-1.25 1.5 1.25 1.5-1.25 1.5 1.25 1.5-1.25V7c0-3.31-2.69-6-6-6z" />
      {/* Eyes */}
      <circle cx="5.8" cy="7" r="1" fill="var(--color-surface)" />
      <circle cx="10.2" cy="7" r="1" fill="var(--color-surface)" />
    </svg>
  );
}

export function ConfigIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

export function CraftsIcon() {
  // Flask / potion bottle
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 2v3.2L4.2 10A3 3 0 0 0 6.9 14h2.2a3 3 0 0 0 2.7-4L9 5.2V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.4 10.5h7.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".4" />
      <circle cx="7" cy="12" r="0.8" fill="currentColor" opacity=".5" />
    </svg>
  );
}

export function UsageIcon() {
  // Calendar with a checkmark day
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.1" opacity=".5" />
      <path d="M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5.5 10l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PaymentsIcon() {
  // Pile of coins (gold)
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* Bottom coin stack */}
      <ellipse cx="8" cy="12.5" rx="5.5" ry="1.8" fill="currentColor" opacity=".35" />
      {/* Middle coin */}
      <ellipse cx="8" cy="10" rx="5.5" ry="1.8" fill="currentColor" opacity=".55" />
      {/* Top face */}
      <ellipse cx="8" cy="7.5" rx="5.5" ry="1.8" fill="currentColor" />
      {/* Coin rim */}
      <path d="M2.5 7.5v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".4" />
      <path d="M13.5 7.5v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".4" />
      <path d="M2.5 10v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".25" />
      <path d="M13.5 10v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".25" />
      {/* Shine on top */}
      <path d="M6 7.1 Q8 6.3 10 7.1" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity=".4" />
    </svg>
  );
}

export function CraftersIcon() {
  // User silhouette with a small hammer badge
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="7" cy="5" r="2.8" />
      <path d="M1.5 14c0-3 2.4-4.8 5.5-4.8s5.5 1.8 5.5 4.8" opacity=".6" />
      {/* Small hammer top-right */}
      <g transform="translate(9.5, 1.5) rotate(-35)">
        {/* Head */}
        <rect x="0" y="0" width="3.2" height="2" rx="0.5" fill="currentColor" />
        {/* Handle */}
        <rect x="1.2" y="2" width="0.9" height="2.8" rx="0.4" fill="currentColor" opacity=".75" />
      </g>
    </svg>
  );
}

export function PricesIcon() {
  // Dollar sign
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 4.5a3 3 0 0 0-3-1.5 3 3 0 0 0 0 6 3 3 0 0 1 0 6A3 3 0 0 1 5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
