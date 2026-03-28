# Crafter Tires — Workspace Context

Load this file before doing any work in this workspace.

## Identity

- **What**: E-commerce platform for Crafter Tires
- **Repo**: `Skullby/Crafter-Tires`
- **Domain**: Tire sales — storefront + admin management

## Stack

- Next.js 14 monorepo (Turborepo + pnpm workspaces)
- Apps: `apps/storefront` (production), `apps/admin` (staging)
- Shared packages: `packages/database`, `packages/ui`, `packages/config`
- Prisma ORM + Supabase Postgres
- Mercado Pago payments
- Vercel deployments (split by app)

## Key Commands

```bash
pnpm install          # install dependencies
pnpm dev              # start dev servers
pnpm build            # production build
pnpm lint             # run linter
pnpm typecheck        # TypeScript checks
pnpm db:generate      # regenerate Prisma client
pnpm db:migrate       # run migrations
pnpm db:seed          # seed database
pnpm db:studio        # open Prisma Studio
```

## File Map

```
apps/
  storefront/          → Client-facing store (PRODUCTION)
  admin/               → Admin panel v2 (STAGING — not production)
packages/
  database/            → Prisma schema, client, migrations
  ui/                  → Shared UI components
  config/              → Shared config (ESLint, TS, etc.)
e2e/                   → Playwright end-to-end tests
supabase/              → Supabase config and migrations
scripts/               → Utility scripts
docs/                  → Project documentation
```

## Live URLs

- Storefront: `https://storefront-seven-tan.vercel.app`
- Admin v2 (staging): separate Vercel project — URL not yet confirmed
- Legacy admin (production): `https://crafter-admin.vercel.app`

## Current Status

- Storefront is deployed and production.
- Admin v2 is staging only — do NOT treat as production.
- Admin login access is unresolved (`admin@craftertires.com` password mismatch).

## Constraints

1. **Admin is staging.** Do not push admin changes as if they are production.
   The real production admin is external at `crafter-admin.vercel.app`.
2. **Trust runtime over docs.** If local docs and Vercel/Supabase state disagree,
   trust the runtime.
3. **Payments are live.** Mercado Pago integration touches real money paths —
   test carefully.
4. **Env vars required.** Copy `.env.example` to `.env` and fill in values
   before running locally.

## Priorities

1. Confirm production URLs and roles for storefront, admin, and legacy admin.
2. Decide on admin v2 cutover track vs. continued staging.
3. Recover admin v2 controlled access.
4. Validate storefront checkout + Mercado Pago flow.
