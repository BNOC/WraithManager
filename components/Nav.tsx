"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/consumables", label: "Consumables" },
  { href: "/payments", label: "Payments" },
  { href: "/crafters", label: "Crafters" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        <Link href="/" className="text-yellow-400 font-bold text-lg tracking-wide">
          WraithManager
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
