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
  // Wallet with a card slot
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="4.5" width="13" height="9" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 7.5h13" stroke="currentColor" strokeWidth="1.1" opacity=".5" />
      <path d="M4 4.5V3.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.1" opacity=".5" />
      <rect x="9.5" y="9.5" width="3" height="2" rx="0.7" fill="currentColor" opacity=".6" />
    </svg>
  );
}

export function CraftersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" opacity=".6" />
    </svg>
  );
}

export function PricesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h6l6 6-6 6-6-6V2z" opacity=".3" />
      <path d="M2 2h6l6 6-6 6-6-6V2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="6" cy="6" r="1.2" />
    </svg>
  );
}
