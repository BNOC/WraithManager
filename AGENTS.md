<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Conventions

## Component Organisation
Components use **feature folders** under `components/`:
- `components/ui/` — shared primitives (badges, icons, inputs, buttons)
- `components/layout/` — nav, shells, page wrappers
- `components/crafters/` — crafter-specific components
- `components/usage/` — usage/raid night components
- `components/consumables/` — craft batch components
- `components/payments/` — payment components
- `components/dashboard/` — dashboard-specific widgets and sections

New components must go in the appropriate feature folder, not the root `components/` directory.

## Domain-Driven Design
This project follows a **DDD approach**. Code is organised by domain/bounded context, not technical layer:

- `lib/actions/crafters.ts` — crafter server actions
- `lib/actions/usage.ts` — usage/raid night server actions
- `lib/actions/batches.ts` — craft batch server actions
- `lib/actions/payments.ts` — payment server actions
- `lib/actions/presets.ts` — note preset server actions
- Domain types and interfaces live close to the domain that owns them
- Shared/cross-domain utilities go in `lib/utils/` (e.g. `lib/utils/format.ts` for gold/date formatters)
- Never dump cross-domain logic into a single file — each domain owns its slice
