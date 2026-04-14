# Componentisation & Cleanup Design

**Date:** 2026-04-14
**Branch:** `Componentise`
**Author:** Sean Keenan

## Overview

A structural refactor of the Wraith Manager codebase to improve readability, maintainability, and consistency. No behaviour changes. The work follows a DDD approach: code is organised by domain/bounded context. A short foundation pass establishes shared utilities and folder structure before domain-by-domain migration begins.

A second phase (SCSS utility class bundling) is deferred and will be designed separately.

---

## Approach

**Domain-by-domain migration with a foundation pass first.**

1. Foundation — shared utilities, folder skeleton, UI primitives relocated
2. Actions split — `lib/actions.ts` split by domain
3. Query layer — server-side data fetching and business logic extracted from pages
4. Component migration — one domain at a time, large components broken into focused sub-components

Each step is independently reviewable. No domain is touched until the previous step is complete.

---

## Phase 1: Foundation Layer

### Shared utilities

| File | Purpose |
|------|---------|
| `lib/utils/format.ts` | `formatGold`, `formatGoldAbbr`, `formatDate`, `formatDateShort` — currently copy-pasted across `page.tsx`, `UsageNightCard.tsx`, and others |
| `lib/utils/classes.ts` | Shared Tailwind class strings: `inputClass`, `selectClass` — currently local constants in `RaidNightForm.tsx` |

### Folder skeleton created upfront

```
components/
  ui/           # shared primitives
  layout/       # nav, shells, wrappers
  dashboard/    # dashboard-specific
  crafters/
  usage/
  consumables/
  payments/
```

### UI primitives relocated

Move from flat `components/` root to `components/ui/`:
- `ItemTypeBadge.tsx`
- `ItemTypeIcon.tsx`
- `RaidDayBadge.tsx`
- `DateInput.tsx`
- `MobileLogoutButton.tsx`
- `MobileThemeButton.tsx`

Extract nav icons from the bottom of `SideNav.tsx` into `components/ui/icons.tsx`.

### Layout components relocated

Move from flat `components/` root to `components/layout/`:
- `Nav.tsx`
- `SideNav.tsx`
- `ThemeProvider.tsx`
- `ThemePicker.tsx`

---

## Phase 2: Actions Split

`lib/actions.ts` (396 lines, all domains) is split by domain:

| File | Actions |
|------|---------|
| `lib/actions/crafters.ts` | `createCrafter`, `updateCrafter`, `setCrafterActive` |
| `lib/actions/batches.ts` | `createCraftBatch`, `updateCraftBatch`, `deleteCraftBatch` |
| `lib/actions/usage.ts` | `createRaidNightUsage`, `updateRaidNight`, `deleteRaidNight` |
| `lib/actions/payments.ts` | Payment-related actions |
| `lib/actions/presets.ts` | `createNotePreset`, `updateNotePreset`, `deleteNotePreset` |
| `lib/actions/_guard.ts` | Shared `requireBnoc()` auth guard, imported by each domain file |

Domain types and interfaces (currently inline in component files) move to the top of their domain's action or query file and are imported where needed. No separate top-level `types/` folder.

---

## Phase 3: Query Layer

Pages currently mix Prisma calls, data transformation, and rendering. Business logic and data fetching are extracted into query helpers. Pages become thin wrappers that call a query function and pass results to components.

| File | Responsibility |
|------|---------------|
| `lib/queries/dashboard.ts` | Four parallel Prisma fetches + inventory map calculation + crafter summary aggregation currently in `app/(app)/page.tsx` |
| `lib/queries/usage.ts` | Usage page data fetching |
| `lib/queries/crafters.ts` | Crafter page data fetching |
| `lib/queries/consumables.ts` | Craft batch queries |

After extraction, each page file should be ~30 lines: import query, call it, pass data to page-level components.

---

## Phase 4: Component Migration (Domain-by-Domain)

### Dashboard — `components/dashboard/`

Extract from `app/(app)/page.tsx`:

| Component | Extracted from |
|-----------|---------------|
| `StatCard.tsx` | The 4-up gold summary strip (inline JSX in page) |
| `InventoryGrid.tsx` | Inventory section incl. mobile/desktop variants (IIFE in page) |
| `CrafterBalanceList.tsx` | Crafter balance rows section |
| `RecentUsageList.tsx` | Recent usage rows section |
| `RecentCraftsList.tsx` | Recent crafts table section |
| `GuildSuppliesWidget.tsx` | Move from components root |
| `WelcomeWidget.tsx` | Move from components root |

### Usage — `components/usage/`

`RaidNightForm.tsx` (584 lines) is broken into:

| Component | Responsibility |
|-----------|---------------|
| `RaidNightForm.tsx` | Orchestrator: holds state, submission logic, date input only |
| `RaidNightEntryRow.tsx` | A single consumable entry row (item type, crafter select, qty, notes) |
| `NotePresetManager.tsx` | Add/edit/delete preset UI |

Also relocated here (unchanged):
- `UsageNightCard.tsx`
- `UsageEditForm.tsx`
- `MissingNightRow.tsx`

### Crafters — `components/crafters/`

Relocated (unchanged):
- `CraftersClient.tsx`
- `CrafterPayCard.tsx`
- `CraftEditForm.tsx`

### Consumables — `components/consumables/`

Relocated (unchanged):
- `ConsumableForm.tsx`
- `ConsumablesFilter.tsx`

### Payments — `components/payments/`

Relocated (unchanged):
- `BatchPayButton.tsx`
- `PaymentsSummary.tsx`

---

## Constraints

- **No behaviour changes** — this is a structural refactor only
- **No new features** — scope is limited to what's described above
- **SCSS utility bundling is out of scope** — deferred to a separate design
- All import paths updated as each domain is migrated
- AGENTS.md already updated with feature folder and DDD conventions

---

## Target File Structure

```
app/
  (app)/
    page.tsx              # ~30 lines, calls lib/queries/dashboard.ts
    layout.tsx
    consumables/...
    crafters/...
    usage/...
    payments/...
    prices/...
  login/...
  globals.css
  layout.tsx

components/
  ui/
    ItemTypeBadge.tsx
    ItemTypeIcon.tsx
    RaidDayBadge.tsx
    DateInput.tsx
    MobileLogoutButton.tsx
    MobileThemeButton.tsx
    icons.tsx
  layout/
    Nav.tsx
    SideNav.tsx
    ThemeProvider.tsx
    ThemePicker.tsx
  dashboard/
    StatCard.tsx
    InventoryGrid.tsx
    CrafterBalanceList.tsx
    RecentUsageList.tsx
    RecentCraftsList.tsx
    GuildSuppliesWidget.tsx
    WelcomeWidget.tsx
  crafters/
    CraftersClient.tsx
    CrafterPayCard.tsx
    CraftEditForm.tsx
  usage/
    RaidNightForm.tsx
    RaidNightEntryRow.tsx
    NotePresetManager.tsx
    UsageNightCard.tsx
    UsageEditForm.tsx
    UsageForm.tsx
    MissingNightRow.tsx
  consumables/
    ConsumableForm.tsx
    ConsumablesFilter.tsx
  payments/
    BatchPayButton.tsx
    PaymentsSummary.tsx

lib/
  actions/
    _guard.ts
    crafters.ts
    batches.ts
    usage.ts
    payments.ts
    presets.ts
  queries/
    dashboard.ts
    usage.ts
    crafters.ts
    consumables.ts
  utils/
    format.ts
    classes.ts
  auth.ts
  prisma.ts
```
