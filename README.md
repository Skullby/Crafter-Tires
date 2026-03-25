# Crafter Tires

Operational README for the active Crafter Tires commerce monorepo.

## Current repo role
- Active client commerce monorepo.
- Storefront production target lives in `apps/storefront` and deploys via the Vercel project `storefront`.
- `apps/admin` is **admin v2 / staging** until access, flows, and cutover are explicitly validated.
- The currently used production admin appears to be outside this monorepo at `https://crafter-admin.vercel.app`.

If local repo docs and runtime reality disagree, treat Vercel + Supabase + workspace `projects/crafter-tires/STATUS.md` as the source of truth.

## Stack
- Next.js 14 monorepo
- Turborepo + pnpm workspaces
- Apps: `apps/storefront`, `apps/admin`
- Shared packages: `packages/database`, `packages/ui`, `packages/config`
- Prisma + Supabase Postgres
- Mercado Pago
- Vercel deployments split by app role

## Repo layout
```text
apps/
  storefront/   # client-facing storefront
  admin/        # admin v2 (currently staging until confirmed)
packages/
  database/
  ui/
  config/
```

## Common commands
```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

Database helpers:
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

## Known operational notes
- `admin@craftertires.com` exists in admin v2, but the previously known seed password no longer matches the stored hash.
- Admin v2 login UX was improved and a staging banner was added, but controlled access is still unresolved.
- Do **not** assume `apps/admin` is production until URL, access, and cutover ownership are explicitly confirmed.

## Environments
- Storefront production: `https://storefront-seven-tan.vercel.app`
- Current admin production (legacy / external): `https://crafter-admin.vercel.app`
- Admin v2: separate Vercel project `admin` (production URL not yet confirmed in workspace metadata)

## Canonical project docs
- Workspace status: `/home/skullby/.openclaw/workspace/projects/crafter-tires/STATUS.md`
- Workspace flows: `/home/skullby/.openclaw/workspace/projects/crafter-tires/FLOWS.md`

## Immediate priorities
1. Confirm the production role and public URL for `storefront`, `admin`, and `crafter-admin`.
2. Decide whether `apps/admin` stays staging or enters a formal cutover track.
3. Recover controlled access to admin v2 and validate critical admin flows.
4. Re-run storefront checkout and Mercado Pago validation before treating deploy state as healthy.
