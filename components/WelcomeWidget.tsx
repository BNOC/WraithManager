import { cookies } from "next/headers";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

export async function WelcomeWidget() {
  const cookieStore = await cookies();
  const username = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!username) return null;

  // Try to find a matching crafter by name (case-insensitive)
  const allCrafters = await prisma.crafter.findMany({
    include: { batches: { select: { quantity: true, costPerUnit: true, paidAmount: true } } },
  });

  const crafter = allCrafters.find(
    (c) => c.name.toLowerCase() === username.toLowerCase() ||
           c.characterName.toLowerCase() === username.toLowerCase()
  ) ?? null;

  const totalOwed = crafter?.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0) ?? 0;
  const totalPaid = crafter?.batches.reduce((s, b) => s + b.paidAmount, 0) ?? 0;
  const outstanding = Math.max(0, totalOwed - totalPaid);
  const batchCount = crafter?.batches.length ?? 0;

  const displayName = crafter?.characterName ?? username;

  return (
    // Outer wrapper adds top padding to make room for the gnome overhang
    <div className="relative pt-2">
      {/* Gnome — sits above the card, translated up */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/gnome.png"
        alt=""
        aria-hidden="true"
        className="absolute right-6 pointer-events-none select-none z-10"
        style={{
          bottom: 0,
          height: "160px",
          width: "auto",
          transform: "translateY(0%)",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      />

      {/* Card */}
      <div className="relative bg-surface border border-rim rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
        {/* Top accent */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary/50 to-transparent" />

        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 15%, transparent) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            maskImage: "linear-gradient(to right, black 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 70%)",
          }}
        />

        <div className="relative px-5 py-4 pr-36">
          {/* Name */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-0.5">Welcome back</p>
          <h2 className="text-2xl font-bold text-ink leading-tight">{displayName}</h2>

          {crafter ? (
            <>
              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-3">
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold">Batches</p>
                  <p className="text-lg font-bold text-ink leading-tight">{batchCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold">Crafted</p>
                  <p className="text-lg font-bold text-ink leading-tight">{formatGold(totalOwed)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold">Outstanding</p>
                  <p className={`text-lg font-bold leading-tight ${outstanding > 0 ? "text-primary" : "text-emerald-400"}`}>
                    {outstanding > 0 ? formatGold(outstanding) : "✓ Settled"}
                  </p>
                </div>
              </div>

              {/* Link */}
              <Link
                href={`/crafters/${crafter.id}`}
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-ink-faint hover:text-primary transition-colors"
              >
                View craft history →
              </Link>
            </>
          ) : (
            <p className="text-ink-faint text-sm mt-2">No crafter profile linked.</p>
          )}
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary/25 to-transparent" />
      </div>
    </div>
  );
}
