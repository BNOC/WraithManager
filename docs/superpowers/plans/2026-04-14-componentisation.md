# Componentisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Wraith Manager codebase into DDD feature folders with extracted utilities, a query layer, and broken-down components — no behaviour changes.

**Architecture:** Foundation pass first (utils + folder skeleton), then actions split by domain, then query layer extracted from pages, then component migration domain-by-domain.

**Tech Stack:** Next.js (App Router), TypeScript, Prisma, Tailwind CSS

**Branch:** `Componentise`

---

## File Map

### Created
| File | Responsibility |
|------|---------------|
| `lib/utils/format.ts` | Canonical gold/date formatters (currently copy-pasted across 6+ files) |
| `lib/utils/classes.ts` | Shared Tailwind class strings (inputClass, selectClass, labelClass) |
| `components/ui/icons.tsx` | Nav icons extracted from SideNav.tsx |
| `lib/actions/_guard.ts` | Shared `requireBnoc()` auth guard |
| `lib/actions/crafters.ts` | Crafter server actions |
| `lib/actions/batches.ts` | Craft batch server actions |
| `lib/actions/usage.ts` | Usage/raid night server actions + RaidNightEntry type |
| `lib/actions/payments.ts` | Payment server actions |
| `lib/actions/presets.ts` | Note preset server actions |
| `lib/actions/prices.ts` | Price config server actions |
| `lib/queries/dashboard.ts` | Dashboard data fetching + inventory/crafter aggregation |
| `lib/queries/consumables.ts` | Consumables data fetching + batch stats |
| `lib/queries/usage.ts` | Usage data fetching + night grouping/gap detection |
| `lib/queries/crafters.ts` | Crafter list + detail data fetching |
| `lib/queries/payments.ts` | Payments data fetching + aggregation |
| `components/dashboard/StatCard.tsx` | 4-up gold summary strip |
| `components/dashboard/InventoryGrid.tsx` | Inventory section (mobile + desktop) |
| `components/dashboard/CrafterBalanceList.tsx` | Crafter balance rows |
| `components/dashboard/RecentUsageList.tsx` | Recent usage rows |
| `components/dashboard/RecentCraftsList.tsx` | Recent crafts table |
| `components/usage/RaidNightEntryRow.tsx` | Single consumable entry row (extracted from RaidNightForm) |
| `components/usage/NotePresetManager.tsx` | Preset add/edit/delete UI (extracted from RaidNightForm) |
| `components/consumables/PaymentBadge.tsx` | Payment status badge (extracted from consumables/page.tsx) |

### Moved (content unchanged, path updated)
| From | To |
|------|----|
| `components/ItemTypeBadge.tsx` | `components/ui/ItemTypeBadge.tsx` |
| `components/ItemTypeIcon.tsx` | `components/ui/ItemTypeIcon.tsx` |
| `components/RaidDayBadge.tsx` | `components/ui/RaidDayBadge.tsx` |
| `components/DateInput.tsx` | `components/ui/DateInput.tsx` |
| `components/MobileLogoutButton.tsx` | `components/ui/MobileLogoutButton.tsx` |
| `components/MobileThemeButton.tsx` | `components/ui/MobileThemeButton.tsx` |
| `components/Nav.tsx` | `components/layout/Nav.tsx` |
| `components/SideNav.tsx` | `components/layout/SideNav.tsx` |
| `components/ThemeProvider.tsx` | `components/layout/ThemeProvider.tsx` |
| `components/ThemePicker.tsx` | `components/layout/ThemePicker.tsx` |
| `components/GuildSuppliesWidget.tsx` | `components/dashboard/GuildSuppliesWidget.tsx` |
| `components/WelcomeWidget.tsx` | `components/dashboard/WelcomeWidget.tsx` |
| `components/CraftersClient.tsx` | `components/crafters/CraftersClient.tsx` |
| `components/CrafterPayCard.tsx` | `components/crafters/CrafterPayCard.tsx` |
| `components/CraftEditForm.tsx` | `components/crafters/CraftEditForm.tsx` |
| `components/RaidNightForm.tsx` | `components/usage/RaidNightForm.tsx` |
| `components/UsageNightCard.tsx` | `components/usage/UsageNightCard.tsx` |
| `components/UsageEditForm.tsx` | `components/usage/UsageEditForm.tsx` |
| `components/UsageForm.tsx` | `components/usage/UsageForm.tsx` |
| `components/MissingNightRow.tsx` | `components/usage/MissingNightRow.tsx` |
| `components/ConsumableForm.tsx` | `components/consumables/ConsumableForm.tsx` |
| `components/ConsumablesFilter.tsx` | `components/consumables/ConsumablesFilter.tsx` |
| `components/BatchPayButton.tsx` | `components/payments/BatchPayButton.tsx` |
| `components/PaymentsSummary.tsx` | `components/payments/PaymentsSummary.tsx` |
| `components/InventoryBreakdown.tsx` | `components/dashboard/InventoryBreakdown.tsx` |

### Deleted
- `lib/actions.ts` (replaced by `lib/actions/*.ts`)

### Modified (imports updated + logic extracted)
- `app/(app)/layout.tsx`
- `app/(app)/page.tsx`
- `app/(app)/consumables/page.tsx`
- `app/(app)/consumables/new/page.tsx`
- `app/(app)/consumables/[id]/edit/page.tsx`
- `app/(app)/usage/page.tsx`
- `app/(app)/usage/new/page.tsx`
- `app/(app)/usage/[id]/edit/page.tsx`
- `app/(app)/usage/night/[dateKey]/edit/page.tsx`
- `app/(app)/crafters/page.tsx`
- `app/(app)/crafters/[id]/page.tsx`
- `app/(app)/payments/page.tsx`
- `app/(app)/prices/page.tsx`
- `app/layout.tsx`
- `app/login/page.tsx`
- All moved components (internal imports updated)

---

## Phase 1 — Foundation

### Task 1: Create folder skeleton

**Files:** directories only

- [ ] Create all feature directories:

```bash
mkdir -p components/ui components/layout components/dashboard components/crafters components/usage components/consumables components/payments
mkdir -p lib/utils lib/actions lib/queries
```

- [ ] Verify directories exist:

```bash
ls components/ && ls lib/
```

Expected: new folders visible alongside existing files.

- [ ] Commit:

```bash
git add -A && git commit -m "chore: create DDD feature folder skeleton"
```

---

### Task 2: Create `lib/utils/format.ts`

**Files:**
- Create: `lib/utils/format.ts`

- [ ] Create the file with all shared formatters (standardising `formatGoldAbbr` on `toLocaleString`):

```typescript
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
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add lib/utils/format.ts && git commit -m "feat: add shared format utilities"
```

---

### Task 3: Create `lib/utils/classes.ts`

**Files:**
- Create: `lib/utils/classes.ts`

- [ ] Create the file with shared class strings:

```typescript
// lib/utils/classes.ts

export const inputClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";

export const selectClass =
  "w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors";

export const labelClass = "block text-sm font-medium text-ink mb-1.5";
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add lib/utils/classes.ts && git commit -m "feat: add shared tailwind class string utilities"
```

---

### Task 4: Move UI primitives to `components/ui/`

**Files:** Move 6 components, update all their import paths in consumers.

Consumers to update after each move are listed below each component.

- [ ] Move `ItemTypeBadge`: copy file to `components/ui/ItemTypeBadge.tsx`, then delete `components/ItemTypeBadge.tsx`. Update imports in:
  - `app/(app)/page.tsx` → `@/components/ui/ItemTypeBadge`
  - `app/(app)/consumables/page.tsx` → (not imported, skip)
  - `app/(app)/crafters/[id]/page.tsx` → `@/components/ui/ItemTypeBadge`
  - `app/(app)/prices/page.tsx` → `@/components/ui/ItemTypeBadge`
  - `components/CrafterPayCard.tsx` → `@/components/ui/ItemTypeBadge`
  - `components/UsageNightCard.tsx` → `@/components/ui/ItemTypeBadge`

- [ ] Move `ItemTypeIcon`: copy to `components/ui/ItemTypeIcon.tsx`, delete old. Update imports in:
  - `app/(app)/page.tsx` → `@/components/ui/ItemTypeIcon`
  - `app/(app)/consumables/page.tsx` → `@/components/ui/ItemTypeIcon`
  - `app/(app)/crafters/[id]/page.tsx` → `@/components/ui/ItemTypeIcon`
  - `app/(app)/prices/page.tsx` → `@/components/ui/ItemTypeIcon`
  - `components/CrafterPayCard.tsx` → `@/components/ui/ItemTypeIcon`
  - `components/GuildSuppliesWidget.tsx` → `@/components/ui/ItemTypeIcon`
  - `components/UsageNightCard.tsx` → `@/components/ui/ItemTypeIcon`

- [ ] Move `RaidDayBadge`: copy to `components/ui/RaidDayBadge.tsx`, delete old. Update imports in:
  - `app/(app)/page.tsx` → `@/components/ui/RaidDayBadge`
  - `components/MissingNightRow.tsx` → `@/components/ui/RaidDayBadge`
  - `components/UsageNightCard.tsx` → `@/components/ui/RaidDayBadge`

- [ ] Move `DateInput`: copy to `components/ui/DateInput.tsx`, delete old. Update imports in:
  - `app/(app)/prices/page.tsx` → `@/components/ui/DateInput`
  - `components/ConsumableForm.tsx` → `@/components/ui/DateInput`
  - `components/CraftEditForm.tsx` → `@/components/ui/DateInput`
  - `components/RaidNightForm.tsx` → `@/components/ui/DateInput`
  - `components/UsageEditForm.tsx` → `@/components/ui/DateInput`
  - `components/UsageForm.tsx` → `@/components/ui/DateInput`

- [ ] Move `MobileLogoutButton`: copy to `components/ui/MobileLogoutButton.tsx`, delete old. Update imports in:
  - `app/(app)/layout.tsx` → `@/components/ui/MobileLogoutButton`

- [ ] Move `MobileThemeButton`: copy to `components/ui/MobileThemeButton.tsx`, delete old. Update imports in:
  - `app/(app)/layout.tsx` → `@/components/ui/MobileThemeButton`
  - Note: `MobileThemeButton` imports `ThemeProvider` — update that path after Task 6.

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: move UI primitives to components/ui/"
```

---

### Task 5: Extract nav icons from SideNav

**Files:**
- Create: `components/ui/icons.tsx`
- Modify: `components/SideNav.tsx`

- [ ] Create `components/ui/icons.tsx` with all icon functions cut from the bottom of `SideNav.tsx` (the `WraithIcon`, `ConfigIcon`, `DashIcon`, `CraftsIcon`, `UsageIcon`, `PaymentsIcon`, `CraftersIcon`, `PricesIcon` functions — lines 182–267):

```tsx
// components/ui/icons.tsx
// Nav icons extracted from SideNav

export function WraithIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="text-primary shrink-0">
      <path d="M8 1C4.69 1 2 3.69 2 7v6.5l1.5-1.25 1.5 1.25 1.5-1.25 1.5 1.25 1.5-1.25 1.5 1.25 1.5-1.25V7c0-3.31-2.69-6-6-6z" />
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
```

- [ ] Update `components/SideNav.tsx`: delete the icon function definitions (lines 182–267) and add at the top:

```typescript
import {
  WraithIcon, ConfigIcon, DashIcon, CraftsIcon,
  UsageIcon, PaymentsIcon, CraftersIcon, PricesIcon,
} from "@/components/ui/icons";
```

Also update the `NAV` array JSX to use the named imports instead of calling local functions.

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: extract nav icons to components/ui/icons.tsx"
```

---

### Task 6: Move layout components to `components/layout/`

**Files:** Move 4 components, update all consumer imports.

- [ ] Move `ThemeProvider`: copy to `components/layout/ThemeProvider.tsx`, delete old. Update imports in:
  - `app/layout.tsx` → `@/components/layout/ThemeProvider`
  - `app/login/page.tsx` → `@/components/layout/ThemeProvider`
  - `components/ui/MobileThemeButton.tsx` → `@/components/layout/ThemeProvider`
  - `components/ThemePicker.tsx` → `@/components/layout/ThemeProvider`

- [ ] Move `ThemePicker`: copy to `components/layout/ThemePicker.tsx`, delete old. Update imports in:
  - `app/(app)/layout.tsx` → `@/components/layout/ThemePicker`

- [ ] Move `SideNav`: copy to `components/layout/SideNav.tsx`, delete old. Update its internal icon import to `@/components/ui/icons`. Update imports in:
  - `app/(app)/layout.tsx` → `@/components/layout/SideNav`

- [ ] Move `Nav`: copy to `components/layout/Nav.tsx`, delete old. (Check if any file imports Nav — likely none, but verify with grep.)

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: move layout components to components/layout/"
```

---

## Phase 2 — Actions Split

### Task 7: Create `lib/actions/_guard.ts`

**Files:**
- Create: `lib/actions/_guard.ts`

- [ ] Create the guard file:

```typescript
// lib/actions/_guard.ts
"use server";

import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function requireBnoc() {
  const cookieStore = await cookies();
  const user = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (user?.toLowerCase() !== "bnoc") throw new Error("Unauthorised");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 8: Create `lib/actions/crafters.ts`

**Files:**
- Create: `lib/actions/crafters.ts`

- [ ] Create the file (content cut from `lib/actions.ts` lines 17–51):

```typescript
// lib/actions/crafters.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireBnoc } from "./_guard";

export async function createCrafter(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name is required");
  await prisma.crafter.create({ data: { name, characterName: name } });
  revalidatePath("/crafters");
  redirect("/crafters");
}

export async function setCrafterActive(id: string, active: boolean) {
  await prisma.crafter.update({ where: { id }, data: { active } });
  revalidatePath("/crafters");
  revalidatePath("/payments");
  revalidatePath("/");
}

export async function updateCrafter(id: string, formData: FormData) {
  await requireBnoc();
  const name = formData.get("name") as string;
  const characterName = formData.get("characterName") as string;
  await prisma.crafter.update({ where: { id }, data: { name, characterName } });
  revalidatePath("/crafters");
  redirect("/crafters");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 9: Create `lib/actions/batches.ts`

**Files:**
- Create: `lib/actions/batches.ts`

- [ ] Create the file (content cut from `lib/actions.ts` lines 54–160):

```typescript
// lib/actions/batches.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";
import { requireBnoc } from "./_guard";

export async function createCraftBatch(formData: FormData) {
  await requireBnoc();
  const crafterId = formData.get("crafterId") as string;
  const itemType = formData.get("itemType") as ItemType;
  const itemName = formData.get("itemName") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const costPerUnit = parseFloat(formData.get("costPerUnit") as string);
  const craftedAtStr = formData.get("craftedAt") as string;
  const notes = formData.get("notes") as string;
  const craftedAt = craftedAtStr ? new Date(craftedAtStr) : new Date();

  await prisma.$transaction(async (tx) => {
    const batch = await tx.craftBatch.create({
      data: { crafterId, itemType, itemName, quantity, costPerUnit, craftedAt, notes: notes || null },
    });
    const unattributedLogs = await tx.usageLog.findMany({
      where: { crafterId, itemType, itemName: itemName || undefined },
      include: { lines: { select: { quantity: true } } },
      orderBy: { raidDate: "asc" },
    });
    let batchRemaining = quantity;
    for (const log of unattributedLogs) {
      if (batchRemaining <= 0) break;
      const attributed = log.lines.reduce((s, l) => s + l.quantity, 0);
      const unattributed = log.quantityUsed - attributed;
      if (unattributed <= 0) continue;
      const take = Math.min(unattributed, batchRemaining);
      await tx.usageLine.create({
        data: { usageLogId: log.id, batchId: batch.id, quantity: take, costPerUnit },
      });
      batchRemaining -= take;
    }
  });

  revalidatePath("/consumables");
  revalidatePath("/usage");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/consumables");
}

export async function updateCraftBatch(id: string, formData: FormData) {
  await requireBnoc();
  const crafterId = formData.get("crafterId") as string;
  const itemType = formData.get("itemType") as ItemType;
  const itemName = formData.get("itemName") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const costPerUnit = parseFloat(formData.get("costPerUnit") as string);
  const craftedAtStr = formData.get("craftedAt") as string;
  const notes = formData.get("notes") as string;
  const craftedAt = craftedAtStr ? new Date(craftedAtStr) : new Date();

  await prisma.$transaction(async (tx) => {
    await tx.craftBatch.update({
      where: { id },
      data: { crafterId, itemType, itemName, quantity, costPerUnit, craftedAt, notes: notes || null },
    });
    await tx.usageLine.updateMany({ where: { batchId: id }, data: { costPerUnit } });
  });

  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/consumables");
}

export async function deleteCraftBatch(id: string) {
  await requireBnoc();
  await prisma.$transaction(async (tx) => {
    await tx.usageLine.deleteMany({ where: { batchId: id } });
    await tx.craftBatch.delete({ where: { id } });
  });
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/consumables");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 10: Create `lib/actions/usage.ts`

**Files:**
- Create: `lib/actions/usage.ts`

- [ ] Create the file (content cut from `lib/actions.ts` lines 162–343). The `fifoAttributeUsage` helper and `RaidNightEntry` type live here:

```typescript
// lib/actions/usage.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";

export type RaidNightEntry = {
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  crafterId: string | null;
  notes: string | null;
};

async function fifoAttributeUsage(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  opts: {
    raidDate: Date;
    itemType: ItemType;
    itemName: string | null;
    quantityUsed: number;
    crafterId: string | null;
    notes: string | null;
  }
) {
  const batches = await tx.craftBatch.findMany({
    where: {
      itemType: opts.itemType,
      itemName: opts.itemName ?? undefined,
      ...(opts.crafterId ? { crafterId: opts.crafterId } : {}),
    },
    include: { usageLines: { select: { quantity: true } } },
    orderBy: { craftedAt: "asc" },
  });

  const available = batches
    .map((b) => ({
      id: b.id,
      costPerUnit: b.costPerUnit,
      remaining: b.quantity - b.usageLines.reduce((s: number, l: { quantity: number }) => s + l.quantity, 0),
    }))
    .filter((b) => b.remaining > 0);

  let toAssign = opts.quantityUsed;
  const lines: { batchId: string; quantity: number; costPerUnit: number }[] = [];
  for (const batch of available) {
    if (toAssign <= 0) break;
    const take = Math.min(toAssign, batch.remaining);
    lines.push({ batchId: batch.id, quantity: take, costPerUnit: batch.costPerUnit });
    toAssign -= take;
  }

  const log = await tx.usageLog.create({
    data: {
      raidDate: opts.raidDate,
      itemType: opts.itemType,
      itemName: opts.itemName,
      quantityUsed: opts.quantityUsed,
      notes: opts.notes,
      crafterId: opts.crafterId,
    },
  });

  if (lines.length > 0) {
    await tx.usageLine.createMany({
      data: lines.map((l) => ({ ...l, usageLogId: log.id })),
    });
  }
}

export async function createRaidNightUsage(raidDate: string, entries: RaidNightEntry[]) {
  if (!entries.length) return;
  const date = new Date(raidDate);
  await prisma.$transaction(async (tx) => {
    for (const entry of entries) {
      await fifoAttributeUsage(tx, {
        raidDate: date,
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName,
        quantityUsed: entry.quantityUsed,
        crafterId: entry.crafterId,
        notes: entry.notes,
      });
    }
  });
  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/usage");
}

export async function deleteUsageLog(id: string) {
  await prisma.usageLog.delete({ where: { id } });
  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
}

export async function updateUsageLog(id: string, raidDate: string, entry: RaidNightEntry) {
  const date = new Date(raidDate);
  await prisma.$transaction(async (tx) => {
    await tx.usageLine.deleteMany({ where: { usageLogId: id } });
    await tx.usageLog.update({
      where: { id },
      data: {
        raidDate: date,
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName,
        quantityUsed: entry.quantityUsed,
        notes: entry.notes,
        crafterId: entry.crafterId,
      },
    });
    const batches = await tx.craftBatch.findMany({
      where: {
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName ?? undefined,
        ...(entry.crafterId ? { crafterId: entry.crafterId } : {}),
      },
      include: { usageLines: { select: { quantity: true } } },
      orderBy: { craftedAt: "asc" },
    });
    const available = batches
      .map((b) => ({
        id: b.id,
        costPerUnit: b.costPerUnit,
        remaining: b.quantity - b.usageLines.reduce((s: number, l: { quantity: number }) => s + l.quantity, 0),
      }))
      .filter((b) => b.remaining > 0);
    let toAssign = entry.quantityUsed;
    const lines: { batchId: string; quantity: number; costPerUnit: number }[] = [];
    for (const batch of available) {
      if (toAssign <= 0) break;
      const take = Math.min(toAssign, batch.remaining);
      lines.push({ batchId: batch.id, quantity: take, costPerUnit: batch.costPerUnit });
      toAssign -= take;
    }
    if (lines.length > 0) {
      await tx.usageLine.createMany({
        data: lines.map((l) => ({ ...l, usageLogId: id })),
      });
    }
  });
  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/usage");
}

export async function updateRaidNight(logIds: string[], newDate: string, entries: RaidNightEntry[]) {
  const date = new Date(newDate);
  await prisma.$transaction(async (tx) => {
    await tx.usageLine.deleteMany({ where: { usageLogId: { in: logIds } } });
    await tx.usageLog.deleteMany({ where: { id: { in: logIds } } });
    for (const entry of entries) {
      await fifoAttributeUsage(tx, {
        raidDate: date,
        itemType: entry.itemType as ItemType,
        itemName: entry.itemName,
        quantityUsed: entry.quantityUsed,
        crafterId: entry.crafterId,
        notes: entry.notes,
      });
    }
  });
  revalidatePath("/usage");
  revalidatePath("/consumables");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/usage");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 11: Create `lib/actions/payments.ts`

**Files:**
- Create: `lib/actions/payments.ts`

- [ ] Create the file:

```typescript
// lib/actions/payments.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateBatchPaidAmount(batchId: string, amount: number) {
  await prisma.craftBatch.update({
    where: { id: batchId },
    data: { paidAmount: amount },
  });
  revalidatePath("/payments");
  revalidatePath("/consumables");
  revalidatePath("/");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 12: Create `lib/actions/presets.ts`

**Files:**
- Create: `lib/actions/presets.ts`

- [ ] Create the file:

```typescript
// lib/actions/presets.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createNotePreset(label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  await prisma.notePreset.create({ data: { label: trimmed } });
  revalidatePath("/usage/new");
}

export async function updateNotePreset(id: string, label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  await prisma.notePreset.update({ where: { id }, data: { label: trimmed } });
  revalidatePath("/usage/new");
}

export async function deleteNotePreset(id: string) {
  await prisma.notePreset.delete({ where: { id } });
  revalidatePath("/usage/new");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 13: Create `lib/actions/prices.ts`

**Files:**
- Create: `lib/actions/prices.ts`

- [ ] Create the file:

```typescript
// lib/actions/prices.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";

export async function createPriceConfig(formData: FormData) {
  const itemType = formData.get("itemType") as ItemType;
  const price = parseFloat(formData.get("price") as string);
  const effectiveDateStr = formData.get("effectiveDate") as string;
  const notes = formData.get("notes") as string;
  const effectiveDate = effectiveDateStr ? new Date(effectiveDateStr) : new Date();
  await prisma.priceConfig.create({
    data: { itemType, price, effectiveDate, notes: notes || null },
  });
  revalidatePath("/prices");
  revalidatePath("/consumables/new");
  redirect("/prices");
}
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 14: Delete `lib/actions.ts` and update all imports

**Files:**
- Delete: `lib/actions.ts`
- Modify: all 8 files that imported from `@/lib/actions`

- [ ] Update `components/BatchPayButton.tsx`:
  - Change: `import { updateBatchPaidAmount } from "@/lib/actions"` 
  - To: `import { updateBatchPaidAmount } from "@/lib/actions/payments"`

- [ ] Update `components/ConsumableForm.tsx`:
  - Change: `import { createCraftBatch } from "@/lib/actions"`
  - To: `import { createCraftBatch } from "@/lib/actions/batches"`

- [ ] Update `components/CraftEditForm.tsx`:
  - Change: `import { updateCraftBatch, deleteCraftBatch } from "@/lib/actions"`
  - To: `import { updateCraftBatch, deleteCraftBatch } from "@/lib/actions/batches"`

- [ ] Update `components/CraftersClient.tsx`:
  - Change: `import { createCrafter, setCrafterActive } from "@/lib/actions"`
  - To: `import { createCrafter, setCrafterActive } from "@/lib/actions/crafters"`

- [ ] Update `components/RaidNightForm.tsx`:
  - Change: `import { createRaidNightUsage, updateRaidNight, createNotePreset, updateNotePreset, deleteNotePreset, type RaidNightEntry } from "@/lib/actions"`
  - To: `import { createRaidNightUsage, updateRaidNight } from "@/lib/actions/usage"` + `import { createNotePreset, updateNotePreset, deleteNotePreset } from "@/lib/actions/presets"` + `import type { RaidNightEntry } from "@/lib/actions/usage"`

- [ ] Update `components/UsageEditForm.tsx`:
  - Change: `import { updateUsageLog, deleteUsageLog, type RaidNightEntry } from "@/lib/actions"`
  - To: `import { updateUsageLog, deleteUsageLog, type RaidNightEntry } from "@/lib/actions/usage"`

- [ ] Update `components/UsageForm.tsx`:
  - Change: `import { createNotePreset } from "@/lib/actions"`
  - To: `import { createNotePreset } from "@/lib/actions/presets"`

- [ ] Update `app/(app)/prices/page.tsx`:
  - Change: `import { createPriceConfig } from "@/lib/actions"`
  - To: `import { createPriceConfig } from "@/lib/actions/prices"`

- [ ] Delete `lib/actions.ts`

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: split lib/actions.ts into domain-specific action files"
```

---

## Phase 3 — Query Layer

### Task 15: Create `lib/queries/dashboard.ts` and thin `app/(app)/page.tsx`

**Files:**
- Create: `lib/queries/dashboard.ts`
- Modify: `app/(app)/page.tsx`

- [ ] Create `lib/queries/dashboard.ts` with all data fetching and calculation logic extracted from `page.tsx`:

```typescript
// lib/queries/dashboard.ts
import prisma from "@/lib/prisma";

export interface CrafterSummary {
  id: string;
  characterName: string;
  active: boolean;
  totalOwed: number;
  totalPaid: number;
  outstanding: number;
}

export interface InventoryItem {
  itemType: string;
  itemName: string;
  remaining: number;
  total: number;
  remainingValue: number;
  isFeast: boolean;
}

export interface RecentBatch {
  id: string;
  itemType: string;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  craftedAt: Date;
  crafter: { characterName: string };
}

export interface RecentUsageLog {
  id: string;
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  raidDate: Date;
  lines: { quantity: number; costPerUnit: number; batch: { crafter: { name: string } } }[];
}

export interface DashboardData {
  crafterSummaries: CrafterSummary[];
  activeSummaries: CrafterSummary[];
  grandOutstanding: number;
  grandTotalPaid: number;
  grandTotalCost: number;
  grandWastedValue: number;
  inventory: InventoryItem[];
  totalInventoryValue: number;
  breakdown: Map<string, { crafterName: string; remaining: number }[]>;
  recentBatches: RecentBatch[];
  recentUsage: RecentUsageLog[];
}

export const INVENTORY_TYPE_ORDER: Record<string, number> = {
  FLASK_CAULDRON: 0,
  POTION_CAULDRON: 1,
  FEAST: 2,
  VANTUS_RUNE: 3,
  OTHER: 4,
};

export async function getDashboardData(): Promise<DashboardData> {
  const [crafters, recentBatches, recentUsage, allBatches] = await Promise.all([
    prisma.crafter.findMany({
      include: {
        batches: {
          include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
        },
      },
    }),
    prisma.craftBatch.findMany({
      orderBy: { craftedAt: "desc" },
      take: 5,
      include: { crafter: true },
    }),
    prisma.usageLog.findMany({
      orderBy: { raidDate: "desc" },
      take: 5,
      include: { lines: { include: { batch: { include: { crafter: true } } } } },
    }),
    prisma.craftBatch.findMany({
      include: {
        usageLines: { select: { quantity: true } },
        crafter: { select: { active: true, characterName: true } },
      },
    }),
  ]);

  const crafterSummaries: CrafterSummary[] = crafters.map((crafter) => {
    const totalOwed = crafter.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0);
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    const outstanding = Math.max(0, totalOwed - totalPaid);
    return {
      id: crafter.id,
      characterName: crafter.characterName,
      active: (crafter as typeof crafter & { active: boolean }).active,
      totalOwed,
      totalPaid,
      outstanding,
    };
  });

  const activeSummaries = crafterSummaries.filter((c) => c.active);
  const grandOutstanding = crafterSummaries.reduce((s, c) => s + c.outstanding, 0);
  const grandTotalPaid = crafterSummaries.reduce((s, c) => s + c.totalPaid, 0);

  type BatchCrafter = { active: boolean; characterName: string };
  const inventoryMap = new Map<string, { itemType: string; itemName: string; remaining: number; total: number; remainingValue: number }>();
  const breakdownRaw = new Map<string, Map<string, number>>();
  let grandWastedValue = 0;

  const grandTotalCost = allBatches.reduce(
    (s: number, b: { costPerUnit: number; usageLines: { quantity: number }[] }) => {
      const used = b.usageLines.reduce((u: number, l: { quantity: number }) => u + l.quantity, 0);
      return s + used * b.costPerUnit;
    },
    0
  );

  for (const b of allBatches) {
    const crafter = b.crafter as BatchCrafter;
    const isWarbound = b.itemType !== "VANTUS_RUNE";
    if (isWarbound && !crafter.active) {
      const used = b.usageLines.reduce((s, l) => s + l.quantity, 0);
      grandWastedValue += (b.quantity - used) * b.costPerUnit;
      continue;
    }
    const used = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const remaining = b.quantity - used;
    const key = `${b.itemType}::${b.itemName}`;
    if (!inventoryMap.has(key))
      inventoryMap.set(key, { itemType: b.itemType, itemName: b.itemName, remaining: 0, total: 0, remainingValue: 0 });
    const entry = inventoryMap.get(key)!;
    entry.remaining += remaining;
    entry.total += b.quantity;
    entry.remainingValue += remaining * b.costPerUnit;
    if (remaining > 0) {
      const bKey = b.itemType === "FEAST" ? "FEAST::Feast" : key;
      if (!breakdownRaw.has(bKey)) breakdownRaw.set(bKey, new Map());
      const cm = breakdownRaw.get(bKey)!;
      const label =
        b.itemType === "VANTUS_RUNE" ? "Guild Bank" : crafter.active ? crafter.characterName : `${crafter.characterName} (inactive)`;
      cm.set(label, (cm.get(label) ?? 0) + remaining);
    }
  }

  const PINNED: { type: string; name: string }[] = [
    { type: "FLASK_CAULDRON", name: "Flask Cauldron" },
    { type: "POTION_CAULDRON", name: "Potion Cauldron" },
    { type: "VANTUS_RUNE", name: "Vantus Rune" },
  ];
  for (const { type, name } of PINNED) {
    const key = `${type}::${name}`;
    if (!inventoryMap.has(key))
      inventoryMap.set(key, { itemType: type, itemName: name, remaining: 0, total: 0, remainingValue: 0 });
  }

  const rawInventory = [...inventoryMap.values()].sort(
    (a, b) => (INVENTORY_TYPE_ORDER[a.itemType] ?? 9) - (INVENTORY_TYPE_ORDER[b.itemType] ?? 9) || a.itemName.localeCompare(b.itemName)
  );

  const feastItems = rawInventory.filter((i) => i.itemType === "FEAST");
  const feastTotal = feastItems.reduce((s, i) => s + i.remaining, 0);
  const feastCraftedTotal = feastItems.reduce((s, i) => s + i.total, 0);
  const nonFeastItems = rawInventory.filter((i) => i.itemType !== "FEAST");

  const inventory: InventoryItem[] = [
    ...nonFeastItems.map((item) => ({ ...item, isFeast: false })),
    { itemType: "FEAST", itemName: "Feast", remaining: feastTotal, total: feastCraftedTotal, remainingValue: 0, isFeast: true },
  ];

  const totalInventoryValue = rawInventory.reduce((s, i) => s + i.remainingValue, 0);

  const breakdown = new Map<string, { crafterName: string; remaining: number }[]>();
  for (const [key, cm] of breakdownRaw) {
    breakdown.set(key, [...cm.entries()].map(([crafterName, remaining]) => ({ crafterName, remaining })));
  }

  return {
    crafterSummaries,
    activeSummaries,
    grandOutstanding,
    grandTotalPaid,
    grandTotalCost,
    grandWastedValue,
    inventory,
    totalInventoryValue,
    breakdown,
    recentBatches,
    recentUsage,
  };
}
```

- [ ] Replace the body of `app/(app)/page.tsx` (retain `export const dynamic`) with a thin shell that calls the query and imports from `lib/utils/format`:

```tsx
// app/(app)/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatGold, formatGoldAbbr, formatDate } from "@/lib/utils/format";
import { ItemTypeBadge } from "@/components/ui/ItemTypeBadge";
import { ItemTypeIcon } from "@/components/ui/ItemTypeIcon";
import { RaidDayBadge } from "@/components/ui/RaidDayBadge";
import { InventoryBreakdown } from "@/components/dashboard/InventoryBreakdown";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const {
    activeSummaries, grandOutstanding, grandTotalPaid, grandTotalCost,
    grandWastedValue, inventory, totalInventoryValue, breakdown, recentBatches, recentUsage,
  } = data;

  // (preserve all existing JSX unchanged — only the data fetching and transformation has moved)
  // ... (full existing JSX from the original file, with formatGold/formatGoldAbbr/formatDate now imported)
}
```

The JSX body stays byte-for-byte identical to the original — no layout or rendering changes. The only differences from the original file are:
1. The four `prisma.*` calls at the top are replaced with `const data = await getDashboardData()`
2. The local `formatGold`, `formatGoldAbbr`, `formatDate` function definitions are deleted
3. The destructure of `data` provides the same variable names the JSX already uses
4. `ItemTypeBadge`, `ItemTypeIcon`, `RaidDayBadge`, `InventoryBreakdown` import paths updated to `@/components/ui/` and `@/components/dashboard/`

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: extract dashboard query logic to lib/queries/dashboard.ts"
```

---

### Task 16: Create `lib/queries/consumables.ts` and thin consumables page

**Files:**
- Create: `lib/queries/consumables.ts`
- Modify: `app/(app)/consumables/page.tsx`

- [ ] Create `lib/queries/consumables.ts`:

```typescript
// lib/queries/consumables.ts
import prisma from "@/lib/prisma";
import type { ItemType } from "@prisma/client";

export interface ConsumableRow {
  id: string;
  itemType: string;
  itemName: string;
  notes: string | null;
  quantity: number;
  costPerUnit: number;
  paidAmount: number;
  craftedAt: Date;
  usedQty: number;
  usedValue: number;
  remaining: number;
  totalValue: number;
  owedAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  crafterActive: boolean;
  isWarbound: boolean;
  isWasted: boolean;
  crafter: { characterName: string; active: boolean };
}

export interface ConsumablesData {
  crafters: { id: string; name: string }[];
  rows: ConsumableRow[];
}

export async function getConsumablesData(filters: {
  crafter?: string;
  type?: string;
  hideEmpty?: boolean;
}): Promise<ConsumablesData> {
  const crafters = await prisma.crafter.findMany({ orderBy: { name: "asc" } });

  const where: Record<string, unknown> = {};
  if (filters.crafter) where.crafterId = filters.crafter;
  if (filters.type && ["FLASK_CAULDRON", "POTION_CAULDRON", "FEAST", "VANTUS_RUNE", "OTHER"].includes(filters.type)) {
    where.itemType = filters.type as ItemType;
  }

  const batches = await prisma.craftBatch.findMany({
    where,
    orderBy: { craftedAt: "desc" },
    include: {
      crafter: true,
      usageLines: { select: { quantity: true, costPerUnit: true } },
    },
  });

  const rows: ConsumableRow[] = batches.map((b) => {
    const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const usedValue = b.usageLines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
    const remaining = b.quantity - usedQty;
    const totalValue = b.quantity * b.costPerUnit;
    const owedAmount = totalValue;
    const paymentStatus: "paid" | "partial" | "unpaid" =
      b.paidAmount >= owedAmount && owedAmount > 0 ? "paid"
      : b.paidAmount > 0 ? "partial"
      : "unpaid";
    const crafterActive = (b.crafter as typeof b.crafter & { active: boolean }).active;
    const isWarbound = b.itemType !== "VANTUS_RUNE";
    const isWasted = !crafterActive && remaining > 0 && isWarbound;
    return { ...b, usedQty, usedValue, remaining, totalValue, owedAmount, paymentStatus, crafterActive, isWarbound, isWasted };
  });

  const visibleRows = filters.hideEmpty ? rows.filter((r) => r.remaining > 0 && !r.isWasted) : rows;

  return {
    crafters: crafters.map((c) => ({ id: c.id, name: c.name })),
    rows: visibleRows,
  };
}
```

- [ ] Update `app/(app)/consumables/page.tsx` to remove the local `formatGold`/`formatDate` functions and the Prisma calls; replace with `getConsumablesData`. Import `formatGold`, `formatDateShort` from `@/lib/utils/format`. The `PaymentBadge` function at the bottom of this file stays inline for now (it moves in Phase 4).

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 17: Create `lib/queries/usage.ts` and thin usage page

**Files:**
- Create: `lib/queries/usage.ts`
- Modify: `app/(app)/usage/page.tsx`

- [ ] Create `lib/queries/usage.ts`. Note: `UsageNightCardProps` is defined here (not in the component) so the query file has no component dependency. `UsageNightCard.tsx` will import the type from here after being moved in Task 21:

```typescript
// lib/queries/usage.ts
import prisma from "@/lib/prisma";

const RAID_DAYS = new Set([1, 3, 4]);
const SEASON_START = "2026-03-18";

function getExpectedRaidNights(until: Date): string[] {
  const nights: string[] = [];
  const start = new Date(`${SEASON_START}T00:00:00.000Z`);
  const cur = new Date(start);
  const end = new Date(Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate()));
  while (cur <= end) {
    if (RAID_DAYS.has(cur.getUTCDay())) nights.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return nights;
}

function toDateKey(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

// Canonical type — UsageNightCard.tsx imports this from here, not the other way around
export interface UsageNightCardLog {
  id: string;
  itemType: string;
  itemName: string | null;
  quantityUsed: number;
  notes: string | null;
  lineValue: number;
  unattributed: number;
  lines: { id: string; quantity: number; costPerUnit: number; crafterName: string; batchCraftedAt: string }[];
}

export interface UsageNightCardProps {
  dateKey: string;
  raidDate: string;
  nightValue: number;
  logs: UsageNightCardLog[];
  defaultOpen?: boolean;
}

export interface UsagePageData {
  totalUsed: number;
  totalValue: number;
  nightCount: number;
  nightCards: UsageNightCardProps[];
  missingKeys: Set<string>;
}

export async function getUsagePageData(): Promise<UsagePageData> {
  const logs = await prisma.usageLog.findMany({
    orderBy: { raidDate: "desc" },
    include: { lines: { include: { batch: { include: { crafter: true } } } } },
  });

  const totalUsed = logs.reduce((s, l) => s + l.quantityUsed, 0);
  const totalValue = logs.reduce(
    (s, l) => s + l.lines.reduce((ls, line) => ls + line.quantity * line.costPerUnit, 0),
    0
  );

  const nights = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = toDateKey(log.raidDate);
    if (!nights.has(key)) nights.set(key, []);
    nights.get(key)!.push(log);
  }
  const nightEntries = [...nights.entries()];

  const loggedKeys = new Set(nightEntries.map(([k]) => k));
  const expectedNights = getExpectedRaidNights(new Date());
  const missingKeys = new Set(expectedNights.filter((k) => !loggedKeys.has(k)));

  const nightCards: UsageNightCardProps[] = nightEntries.map(([dateKey, nightLogs]) => {
    const nightValue = nightLogs.reduce(
      (s, log) => s + log.lines.reduce((ls, l) => ls + l.quantity * l.costPerUnit, 0),
      0
    );
    return {
      dateKey,
      raidDate: nightLogs[0].raidDate.toISOString(),
      nightValue,
      logs: nightLogs.map((log) => {
        const lineValue = log.lines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
        const unattributed = log.quantityUsed - log.lines.reduce((s, l) => s + l.quantity, 0);
        return {
          id: log.id,
          itemType: log.itemType,
          itemName: log.itemName,
          quantityUsed: log.quantityUsed,
          notes: log.notes,
          lineValue,
          unattributed,
          lines: log.lines.map((line) => ({
            id: line.id,
            quantity: line.quantity,
            costPerUnit: line.costPerUnit,
            crafterName: line.batch.crafter.name,
            batchCraftedAt: line.batch.craftedAt.toISOString(),
          })),
        };
      }),
    };
  });

  return { totalUsed, totalValue, nightCount: nightEntries.length, nightCards, missingKeys };
}
```

- [ ] Update `app/(app)/usage/page.tsx` to remove all data fetching and replace with `getUsagePageData()`. Remove local `formatGold` and `toDateKey`/`getExpectedRaidNights` (moved to query). Import `formatGold` from `@/lib/utils/format`. Update `UsageNightCard` import to still use `@/components/UsageNightCard` (old path — it moves in Task 21). Import `UsageNightCardProps` type from `@/lib/queries/usage` instead of the component.

- [ ] Update `components/UsageNightCard.tsx`: change `export interface UsageNightCardProps` to instead `import type { UsageNightCardProps } from "@/lib/queries/usage"` — remove the local definition and use the canonical one from the query file.

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 18: Create `lib/queries/crafters.ts` and thin crafter pages

**Files:**
- Create: `lib/queries/crafters.ts`
- Modify: `app/(app)/crafters/page.tsx`, `app/(app)/crafters/[id]/page.tsx`

- [ ] Create `lib/queries/crafters.ts`:

```typescript
// lib/queries/crafters.ts
import prisma from "@/lib/prisma";

export interface CrafterStat {
  id: string;
  name: string;
  active: boolean;
  batchCount: number;
  totalCraftedValue: number;
  totalOwed: number;
  totalPaid: number;
}

export async function getCrafterStats(): Promise<CrafterStat[]> {
  const crafters = await prisma.crafter.findMany({
    orderBy: { name: "asc" },
    include: { batches: true },
  });
  return crafters.map((crafter) => {
    const totalCraftedValue = crafter.batches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0);
    const totalPaid = crafter.batches.reduce((s, b) => s + b.paidAmount, 0);
    const totalOwed = Math.max(0, totalCraftedValue - totalPaid);
    return {
      id: crafter.id,
      name: crafter.name,
      active: (crafter as typeof crafter & { active: boolean }).active,
      batchCount: crafter.batches.length,
      totalCraftedValue,
      totalOwed,
      totalPaid,
    };
  });
}

export interface CrafterDetailBatch {
  id: string;
  itemType: string;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  paidAmount: number;
  craftedAt: Date;
  notes: string | null;
  totalValue: number;
  usedQty: number;
  unusedQty: number;
  outstanding: number;
  isFullyPaid: boolean;
  isPartial: boolean;
}

export interface CrafterDetail {
  id: string;
  name: string;
  characterName: string;
  active: boolean;
  batches: CrafterDetailBatch[];
  totalOwed: number;
  totalPaid: number;
  grandOutstanding: number;
  pct: number;
}

export async function getCrafterDetail(id: string): Promise<CrafterDetail | null> {
  const crafter = await prisma.crafter.findUnique({
    where: { id },
    include: {
      batches: {
        orderBy: { craftedAt: "desc" },
        include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
      },
    },
  });
  if (!crafter) return null;

  const batches: CrafterDetailBatch[] = crafter.batches.map((b) => {
    const totalValue = b.quantity * b.costPerUnit;
    const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
    const unusedQty = b.quantity - usedQty;
    const outstanding = Math.max(0, totalValue - b.paidAmount);
    const isFullyPaid = b.paidAmount >= totalValue;
    const isPartial = !isFullyPaid && b.paidAmount > 0;
    return { ...b, totalValue, usedQty, unusedQty, outstanding, isFullyPaid, isPartial };
  });

  const totalOwed = batches.reduce((s, b) => s + b.totalValue, 0);
  const totalPaid = batches.reduce((s, b) => s + b.paidAmount, 0);
  const grandOutstanding = Math.max(0, totalOwed - totalPaid);
  const pct = totalOwed > 0 ? Math.min(100, (totalPaid / totalOwed) * 100) : 100;

  return {
    id: crafter.id,
    name: crafter.name,
    characterName: crafter.characterName,
    active: (crafter as typeof crafter & { active: boolean }).active,
    batches,
    totalOwed,
    totalPaid,
    grandOutstanding,
    pct,
  };
}
```

- [ ] Update `app/(app)/crafters/page.tsx`: remove Prisma call and `crafterStats` derivation, replace with `getCrafterStats()`. Update component import to `@/components/crafters/CraftersClient`.

- [ ] Update `app/(app)/crafters/[id]/page.tsx`: remove Prisma call and batch stat derivation, replace with `getCrafterDetail(id)`. Remove local `formatGold`/`formatDate`; import from `@/lib/utils/format`. Update `BatchPayButton` import to `@/components/payments/BatchPayButton`.

- [ ] Verify TypeScript: `npx tsc --noEmit`

---

### Task 19: Create `lib/queries/payments.ts` and thin payments page

**Files:**
- Create: `lib/queries/payments.ts`
- Modify: `app/(app)/payments/page.tsx`

- [ ] Create `lib/queries/payments.ts`:

```typescript
// lib/queries/payments.ts
import prisma from "@/lib/prisma";

export interface PaymentBatchRow {
  id: string;
  itemType: string;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  paidAmount: number;
  craftedAt: Date;
  usedQty: number;
  unusedQty: number;
  usedValue: number;
  owedAmount: number;
}

export interface CrafterPaymentStat {
  id: string;
  name: string;
  characterName: string;
  active: boolean;
  batchRows: PaymentBatchRow[];
  totalOwed: number;
  totalPaid: number;
  balance: number;
}

export interface PaymentsData {
  crafterStats: CrafterPaymentStat[];
  grandTotalPaid: number;
}

export async function getPaymentsData(): Promise<PaymentsData> {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
    include: {
      batches: {
        orderBy: { craftedAt: "desc" },
        include: { usageLines: { select: { quantity: true, costPerUnit: true } } },
      },
    },
  });

  const crafterStats: CrafterPaymentStat[] = crafters.map((crafter) => {
    const batchRows: PaymentBatchRow[] = crafter.batches.map((b) => {
      const usedQty = b.usageLines.reduce((s, l) => s + l.quantity, 0);
      const unusedQty = b.quantity - usedQty;
      const usedValue = b.usageLines.reduce((s, l) => s + l.quantity * l.costPerUnit, 0);
      const owedAmount = b.quantity * b.costPerUnit;
      return { ...b, usedQty, unusedQty, usedValue, owedAmount };
    });
    const totalOwed = batchRows.reduce((s, b) => s + b.owedAmount, 0);
    const totalPaid = batchRows.reduce((s, b) => s + b.paidAmount, 0);
    const balance = totalOwed - totalPaid;
    return {
      id: crafter.id,
      name: crafter.name,
      characterName: crafter.characterName,
      active: (crafter as typeof crafter & { active: boolean }).active,
      batchRows,
      totalOwed,
      totalPaid,
      balance,
    };
  });

  const grandTotalPaid = crafterStats.reduce((s, c) => s + c.totalPaid, 0);
  return { crafterStats, grandTotalPaid };
}
```

- [ ] Update `app/(app)/payments/page.tsx`: remove Prisma call and aggregation, replace with `getPaymentsData()`. Remove local `formatGoldAbbr`; import from `@/lib/utils/format`. Update `CrafterPayCard` import to `@/components/crafters/CrafterPayCard`.

- [ ] Create `lib/queries/prices.ts` with the data fetch and current-prices derivation:

```typescript
// lib/queries/prices.ts
import prisma from "@/lib/prisma";
import type { ItemType } from "@prisma/client";

export interface PriceConfig {
  id: string;
  itemType: ItemType;
  price: number;
  effectiveDate: Date;
  notes: string | null;
}

export interface PricesData {
  allConfigs: PriceConfig[];
  currentPrices: Map<ItemType, PriceConfig>;
}

export async function getPricesData(): Promise<PricesData> {
  const allConfigs = await prisma.priceConfig.findMany({
    orderBy: { effectiveDate: "desc" },
  });
  const currentPrices = new Map<ItemType, PriceConfig>();
  for (const c of allConfigs) {
    if (!currentPrices.has(c.itemType)) currentPrices.set(c.itemType, c);
  }
  return { allConfigs, currentPrices };
}
```

- [ ] Update `app/(app)/prices/page.tsx`: replace the Prisma call and `currentPrices` derivation with `getPricesData()`. Remove local `formatGold`/`formatDate`/`inputClass`/`labelClass`; import from `@/lib/utils/format` and `@/lib/utils/classes`. The sort/filter helper functions (`sortUrl`, `filterUrl`, `filterClass`, `sortIndicator`) stay in the page since they depend on URL params.

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: extract query layer to lib/queries/, remove duplicate formatters from pages"
```

---

## Phase 4 — Component Migration

### Task 20: Move dashboard components to `components/dashboard/`

**Files:** Move `GuildSuppliesWidget`, `WelcomeWidget`, `InventoryBreakdown`.

- [ ] Move `GuildSuppliesWidget.tsx` to `components/dashboard/GuildSuppliesWidget.tsx`. Update internal import of `ItemTypeIcon` to `@/components/ui/ItemTypeIcon`. Update import in `app/(app)/layout.tsx`.

- [ ] Move `WelcomeWidget.tsx` to `components/dashboard/WelcomeWidget.tsx`. Update import in `app/(app)/page.tsx` if used there, or wherever it's consumed.

- [ ] Move `InventoryBreakdown.tsx` to `components/dashboard/InventoryBreakdown.tsx`. Update import in `app/(app)/page.tsx` → `@/components/dashboard/InventoryBreakdown`.

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: move dashboard components to components/dashboard/"
```

---

### Task 21: Move usage components and split `RaidNightForm`

**Files:**
- Move: `UsageNightCard.tsx`, `UsageEditForm.tsx`, `UsageForm.tsx`, `MissingNightRow.tsx` → `components/usage/`
- Create: `components/usage/RaidNightEntryRow.tsx` (extracted from RaidNightForm)
- Create: `components/usage/NotePresetManager.tsx` (extracted from RaidNightForm)
- Move + shrink: `RaidNightForm.tsx` → `components/usage/RaidNightForm.tsx`

- [ ] Move `UsageNightCard.tsx`, `UsageEditForm.tsx`, `UsageForm.tsx`, `MissingNightRow.tsx` to `components/usage/`. Update their internal imports (`DateInput` → `@/components/ui/DateInput`, `RaidDayBadge` → `@/components/ui/RaidDayBadge`, `ItemTypeBadge` → `@/components/ui/ItemTypeBadge`, etc.) and the format functions to import from `@/lib/utils/format`.

- [ ] Update all pages that import these components to use the `@/components/usage/` path:
  - `app/(app)/usage/page.tsx`
  - `app/(app)/usage/[id]/edit/page.tsx`
  - `app/(app)/usage/new/page.tsx`
  - `app/(app)/usage/night/[dateKey]/edit/page.tsx`

- [ ] Create `components/usage/RaidNightEntryRow.tsx` by extracting the `EntryRow` function (lines 363–584 of the original `RaidNightForm.tsx`). Rename it to `RaidNightEntryRow`. Import `inputClass`, `selectClass` from `@/lib/utils/classes`:

```tsx
// components/usage/RaidNightEntryRow.tsx
"use client";

import { useEffect } from "react";
import { inputClass, selectClass } from "@/lib/utils/classes";

// Re-export the shared types this component depends on
export interface Crafter { id: string; characterName: string; active: boolean; }
export interface BatchSummary { itemType: string; itemName: string; remaining: number; craftedAt: Date; crafter: string; crafterId: string; }
export interface NotePreset { id: string; label: string; }
export type EntryState = { key: number; itemType: string; itemName: string; quantityUsed: number; crafterId: string; notes: string; };

const AUTO_NAMES: Partial<Record<string, string>> = {
  FLASK_CAULDRON: "Flask Cauldron",
  POTION_CAULDRON: "Potion Cauldron",
  VANTUS_RUNE: "Vantus Rune",
};

const FEAST_OPTIONS = ["Primary Stat", "Secondary Stat"];
export const DEFAULT_NOTE_PRESETS = ["Split 1", "Split 2", "Mains"];

export function RaidNightEntryRow({
  index, entry, crafters, stock, getCrafterStock, presets, canRemove, onUpdate, onRemove,
}: {
  index: number;
  entry: EntryState;
  crafters: Crafter[];
  stock: { available: BatchSummary[]; total: number; crafterTotal: number; otherTotal: number };
  getCrafterStock: (crafterId: string, itemType: string, itemName: string) => number;
  presets: NotePreset[];
  canRemove: boolean;
  onUpdate: (patch: Partial<EntryState>) => void;
  onRemove: () => void;
}) {
  // (full body of the original EntryRow function, unchanged)
}
```

- [ ] Create `components/usage/NotePresetManager.tsx` by extracting the note preset section (lines 212–340 of original RaidNightForm). It takes `presets` + `onPresetsChange` as props and manages its own local UI state (showAddPreset, newPresetLabel, etc.). Calls actions from `@/lib/actions/presets`:

```tsx
// components/usage/NotePresetManager.tsx
"use client";

import { useState, useTransition } from "react";
import { createNotePreset, updateNotePreset, deleteNotePreset } from "@/lib/actions/presets";

interface NotePreset { id: string; label: string; }

export function NotePresetManager({
  presets,
  onPresetsChange,
}: {
  presets: NotePreset[];
  onPresetsChange: (presets: NotePreset[]) => void;
}) {
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [showManagePresets, setShowManagePresets] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetLabel, setEditingPresetLabel] = useState("");
  const [isAddingPreset, startAddPreset] = useTransition();
  const [, startMutatePreset] = useTransition();

  // (full body of the preset management JSX from original RaidNightForm, lines 212–340)
  // onPresetsChange replaces the setPresets calls
}
```

- [ ] Slim down `components/usage/RaidNightForm.tsx` to be an orchestrator only: it holds `raidDate`, `entries`, `nextKey`, `presets` state; renders `DateInput`, maps `entries` to `<RaidNightEntryRow>`, renders `<NotePresetManager>`, and renders the submit/cancel buttons. Remove the `EntryRow` function and the inline preset JSX block:

```tsx
// components/usage/RaidNightForm.tsx (after split)
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRaidNightUsage, updateRaidNight, type RaidNightEntry } from "@/lib/actions/usage";
import { DateInput } from "@/components/ui/DateInput";
import { inputClass } from "@/lib/utils/classes";
import { RaidNightEntryRow, type EntryState, type Crafter, type BatchSummary, type NotePreset, DEFAULT_NOTE_PRESETS } from "./RaidNightEntryRow";
import { NotePresetManager } from "./NotePresetManager";
// ... (orchestrator-only implementation)
```

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: migrate usage components, split RaidNightForm into focused sub-components"
```

---

### Task 22: Move crafters components to `components/crafters/`

**Files:** Move `CraftersClient.tsx`, `CrafterPayCard.tsx`, `CraftEditForm.tsx`.

- [ ] Move each file to `components/crafters/`. Update internal imports within each (e.g. `ItemTypeBadge` → `@/components/ui/ItemTypeBadge`, `DateInput` → `@/components/ui/DateInput`, `BatchPayButton` → `@/components/payments/BatchPayButton`, actions → `@/lib/actions/crafters` etc.).

- [ ] Update consumers:
  - `app/(app)/crafters/page.tsx` → `@/components/crafters/CraftersClient`
  - `app/(app)/crafters/[id]/page.tsx` → `@/components/crafters/CrafterPayCard` (if used — check)
  - `app/(app)/payments/page.tsx` → `@/components/crafters/CrafterPayCard`

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: migrate crafters components to components/crafters/"
```

---

### Task 23: Move consumables components to `components/consumables/`

**Files:**
- Move: `ConsumableForm.tsx`, `ConsumablesFilter.tsx` → `components/consumables/`
- Create: `components/consumables/PaymentBadge.tsx` (extracted from `consumables/page.tsx`)

- [ ] Move `ConsumableForm.tsx` and `ConsumablesFilter.tsx` to `components/consumables/`. Update internal imports in each (`DateInput` → `@/components/ui/DateInput`, actions → `@/lib/actions/batches`).

- [ ] Extract the `PaymentBadge` function from the bottom of `app/(app)/consumables/page.tsx` into `components/consumables/PaymentBadge.tsx`:

```tsx
// components/consumables/PaymentBadge.tsx

export function PaymentBadge({
  paidAmount,
  owedAmount,
  status,
}: {
  paidAmount: number;
  owedAmount: number;
  status: string;
}) {
  if (owedAmount === 0) return <span className="text-ink-faint text-xs">Nothing owed</span>;
  if (status === "paid") return <span className="text-xs text-green-400 font-medium">✓ Paid</span>;
  if (status === "partial")
    return (
      <span className="text-xs text-amber-400">
        Part-paid ({Math.round((paidAmount / owedAmount) * 100)}%)
      </span>
    );
  return <span className="text-xs text-ink-dim">Unpaid</span>;
}
```

- [ ] In `app/(app)/consumables/page.tsx`: delete the inline `PaymentBadge` function, add `import { PaymentBadge } from "@/components/consumables/PaymentBadge"`. Update `ConsumableForm`/`ConsumablesFilter` imports to `@/components/consumables/`.

- [ ] Update `app/(app)/consumables/new/page.tsx` and `app/(app)/consumables/[id]/edit/page.tsx` to use `@/components/consumables/` paths.

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: migrate consumables components, extract PaymentBadge"
```

---

### Task 24: Move payments components to `components/payments/`

**Files:** Move `BatchPayButton.tsx`, `PaymentsSummary.tsx`.

- [ ] Move both files to `components/payments/`. Update internal imports (`actions` → `@/lib/actions/payments`).

- [ ] Update all consumers:
  - `app/(app)/crafters/[id]/page.tsx` → `@/components/payments/BatchPayButton`
  - `components/crafters/CrafterPayCard.tsx` → `@/components/payments/BatchPayButton`

- [ ] Verify TypeScript: `npx tsc --noEmit`

- [ ] Commit:

```bash
git add -A && git commit -m "refactor: migrate payments components to components/payments/"
```

---

## Phase 5 — Final Verification

### Task 25: Full build verification

**Files:** No changes — verification only.

- [ ] Confirm no files remain in the `components/` root (only subdirectories should exist):

```bash
ls components/
```

Expected: only `ui/ layout/ dashboard/ crafters/ usage/ consumables/ payments/`

- [ ] Run full TypeScript check: `npx tsc --noEmit`

Expected: zero errors.

- [ ] Run Next.js build:

```bash
npm run build
```

Expected: build completes with no errors. All routes compiled successfully.

- [ ] Start the dev server and manually spot-check key pages:

```bash
npm run dev
```

Visit in browser:
- `/` — dashboard loads, inventory and stat card show
- `/consumables` — table loads with filters
- `/usage` — usage nights and missing nights show
- `/crafters` — crafter list loads
- `/payments` — payment cards load
- `/prices` — price history and form load
- `/usage/new` — raid night form with entry rows and presets
- `/consumables/new` — craft batch form

- [ ] Commit final state:

```bash
git add -A && git commit -m "refactor: complete componentisation — DDD structure, query layer, shared utils"
```
