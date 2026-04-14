"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { logoutAction } from "@/app/login/actions";
import { WraithIcon, ConfigIcon, DashIcon, CraftsIcon, UsageIcon, PaymentsIcon, CraftersIcon, PricesIcon } from "@/components/ui/icons";

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

export function SideNav({ widget }: { widget?: React.ReactNode }) {
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

        {/* Guild supplies widget */}
        {widget}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-rim flex items-center justify-between">
          <p className="text-xs font-bold" style={{ color: "#33937f" }}>@BNOC</p>
          <LogoutButton />
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

function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="text-xs text-ink-faint hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {pending ? "…" : "Sign out"}
    </button>
  );
}
