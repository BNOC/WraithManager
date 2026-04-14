import { cookies } from "next/headers";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

function formatGold(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

// Map app username (lowercase) → WoW character on EU realms
const CHARACTER_MAP: Record<string, { realm: string; character: string }> = {
  bnoc:  { realm: "draenor", character: "bnoce" },
  phae:  { realm: "draenor", character: "bnocs" },
  cassy: { realm: "draenor", character: "sethyra" },
};
const DEFAULT_CHARACTER = { realm: "draenor", character: "bnoce" };

async function getCharacterRenderUrl(username: string): Promise<string | null> {
  const clientId = process.env.BLIZZARD_CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    // Client-credentials token — no user consent needed
    const tokenRes = await fetch("https://oauth.battle.net/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) return null;
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const { realm, character } = CHARACTER_MAP[username.toLowerCase()] ?? DEFAULT_CHARACTER;

    const mediaRes = await fetch(
      `https://eu.api.blizzard.com/profile/wow/character/${realm}/${character}/character-media?namespace=profile-eu&locale=en_GB`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!mediaRes.ok) return null;

    const data = (await mediaRes.json()) as { assets?: { key: string; value: string }[] };
    const assets = data.assets ?? [];
    // Prefer full-body "main-raw", fall back to first available asset
    return assets.find((a) => a.key === "main-raw")?.value ?? assets[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function WelcomeWidget() {
  const cookieStore = await cookies();
  const username = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!username) return null;

  const [allCrafters, characterRenderUrl] = await Promise.all([
    prisma.crafter.findMany({
      include: { batches: { select: { quantity: true, costPerUnit: true, paidAmount: true } } },
    }),
    getCharacterRenderUrl(username),
  ]);

  const crafter =
    allCrafters.find(
      (c) =>
        c.name.toLowerCase() === username.toLowerCase() ||
        c.characterName.toLowerCase() === username.toLowerCase()
    ) ?? null;

  const totalOwed = crafter?.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0) ?? 0;
  const totalPaid = crafter?.batches.reduce((s, b) => s + b.paidAmount, 0) ?? 0;
  const outstanding = Math.max(0, totalOwed - totalPaid);
  const batchCount = crafter?.batches.length ?? 0;
  const displayName = crafter?.characterName ?? username;

  return (
    <div className="relative bg-surface border border-rim rounded-2xl shadow-xl shadow-black/40 overflow-hidden h-full">
      {/* Top accent */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      {/* Dot-grid background — fades left-to-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 15%, transparent) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage: "linear-gradient(to right, black 0%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 70%)",
        }}
      />

      {/* Character render — right-aligned, fades at left edge */}
      {characterRenderUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={characterRenderUrl}
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 pointer-events-none select-none h-full w-auto object-cover object-top"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 35%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 35%)",
          }}
        />
      )}

      {/* Content */}
      <div className={`relative px-5 py-4 ${characterRenderUrl ? "pr-36" : ""}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-0.5">Welcome back</p>
        <h2 className="text-2xl font-bold text-ink leading-tight">{displayName}</h2>

        {crafter ? (
          <>
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
  );
}
