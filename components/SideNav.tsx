"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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

// Mobile bottom nav — main items only so labels fit
const MOBILE_NAV = NAV[0].items;

export function SideNav() {
  const pathname = usePathname();
  const [configOpen, setConfigOpen] = useState(false);

  // Close config menu on navigation
  useEffect(() => { setConfigOpen(false); }, [pathname]);

  const configActive = NAV[1].items.some((i) => pathname.startsWith(i.href));

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop side nav */}
      <nav className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 z-30 bg-surface border-r border-rim">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-rim">
          <Link href="/" className="flex items-center gap-2.5 group">
            <WraithIcon />
            <span className="font-bold text-ink tracking-tight leading-none">
              Wraith<span className="text-primary">Debt</span>
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
          <p className="text-xs font-bold text-center" style={{ color: "#33937f" }}>@BNOC</p>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      {/* Config slide-up panel */}
      {configOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setConfigOpen(false)}
          />
          {/* Panel */}
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 mx-3 mb-1 bg-surface border border-rim rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <p className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-faint border-b border-rim">
              Config
            </p>
            {NAV[1].items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-rim/50 last:border-0 ${
                    active ? "text-primary bg-primary/5" : "text-ink hover:bg-surface-hi"
                  }`}
                >
                  <span className={`w-5 h-5 shrink-0 ${active ? "text-primary" : "text-ink-faint"}`}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-rim flex items-center justify-around px-1 py-1 safe-area-bottom">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                active ? "text-primary" : "text-ink-faint hover:text-ink-dim"
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Config tab */}
        <button
          type="button"
          onClick={() => setConfigOpen((v) => !v)}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
            configActive || configOpen ? "text-primary" : "text-ink-faint hover:text-ink-dim"
          }`}
        >
          <span className="w-5 h-5"><ConfigIcon /></span>
          <span className="text-[10px] font-medium">Config</span>
        </button>
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

function ConfigIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function UsageIcon() {
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

function PaymentsIcon() {
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
