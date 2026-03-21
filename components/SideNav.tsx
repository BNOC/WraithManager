"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    group: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: <DashIcon /> },
      { href: "/consumables", label: "Crafts", icon: <CraftsIcon /> },
      { href: "/usage", label: "Usage", icon: <UsageIcon /> },
      { href: "/payments", label: "Payments", icon: <PaymentsIcon /> },
    ],
  },
  {
    group: "Config",
    items: [
      { href: "/crafters", label: "Crafters", icon: <CraftersIcon /> },
      { href: "/prices", label: "Prices", icon: <PricesIcon /> },
    ],
  },
];

// Mobile bottom nav (same items but icon-only)
const MOBILE_NAV = NAV.flatMap((g) => g.items);

export function SideNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop side nav */}
      <nav className="hidden md:flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-rim">
          <Link href="/" className="flex items-center gap-2.5 group">
            <WraithIcon />
            <span className="font-bold text-ink tracking-tight leading-none">
              Wraith<span className="text-primary">Manager</span>
            </span>
          </Link>
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV.map((group) => (
            <div key={group.group}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-ink-dim hover:bg-surface-hi hover:text-ink"
                        }`}
                      >
                        <span className={`shrink-0 ${active ? "text-primary" : "text-ink-faint"}`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-rim">
          <p className="text-ink-faint text-xs">@BNOC</p>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-rim flex items-center justify-around px-1 py-1.5 safe-area-bottom">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active ? "text-primary" : "text-ink-faint hover:text-ink-dim"
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────────

function WraithIcon() {
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

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function CraftsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2h2v3H3zM3 11h2v3H3zM11 2h2v3h-2zM11 11h2v3h-2z" />
      <path d="M2 4.5h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7z" opacity=".4" />
      <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function UsageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="2" width="12" height="12" rx="2" opacity=".2" />
      <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="8" r="6.5" opacity=".2" />
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <text x="8" y="11.5" textAnchor="middle" fontSize="7" fontWeight="bold">g</text>
    </svg>
  );
}

function CraftersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" opacity=".6" />
    </svg>
  );
}

function PricesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h6l6 6-6 6-6-6V2z" opacity=".3" />
      <path d="M2 2h6l6 6-6 6-6-6V2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="6" cy="6" r="1.2" />
    </svg>
  );
}
