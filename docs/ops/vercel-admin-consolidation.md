# Crafter Tires Admin — Vercel consolidation state

_Last updated: 2026-03-17 UTC_

## Executive summary

- **Canonical admin project:** `admin`
- **Legacy / retirement candidate:** `crafter-admin`
- **Current public admin URL:** `https://crafter-admin.vercel.app`
- **Current routing status:** `crafter-admin.vercel.app` is already aliased to a deployment from the **`admin`** project.
- **Custom domains:** none configured yet in Vercel.

## Evidence captured

### 1) Repo linkage / project configuration

Local Vercel links in repo:

- Repo root `.vercel/project.json` → project **`storefront`**
- `apps/admin/.vercel/project.json` → project **`admin`**

Relevant `apps/admin/.vercel/project.json` content:

```json
{"projectId":"prj_x5WvAX7RtZEiJhWkNlq0YWYxYSku","orgId":"team_LKTWezCEWbt0u42ZlTEaZjOW","projectName":"admin"}
```

Relevant `vercel project inspect admin` output:

- Name: `admin`
- Root Directory: `apps/admin`
- Framework Preset: `Next.js`
- Build Command: `corepack pnpm --filter @crafter/database db:generate && corepack pnpm --filter admin build`

Relevant `vercel project inspect crafter-admin` output:

- Name: `crafter-admin`
- Root Directory: `.`
- Framework Preset: `Other`
- This is the old workaround project and should be retired after final cleanup.

### 2) Alias / domain state

Observed from `vercel alias ls`:

- `admin-pjk8qwia1-skullbys-projects.vercel.app` → `admin-ten-beta-78.vercel.app`
- `admin-pjk8qwia1-skullbys-projects.vercel.app` → `admin-git-main-skullbys-projects.vercel.app`
- `admin-pjk8qwia1-skullbys-projects.vercel.app` → `admin-skullbys-projects.vercel.app`
- **`admin-pjk8qwia1-skullbys-projects.vercel.app` → `crafter-admin.vercel.app`**
- `crafter-admin-hhmeogtfs-skullbys-projects.vercel.app` → `crafter-admin-skullbys-projects.vercel.app`
- `crafter-admin-hhmeogtfs-skullbys-projects.vercel.app` → `crafter-admin-skullby-skullbys-projects.vercel.app`

Interpretation:

- The public alias **`crafter-admin.vercel.app` already points to a deployment created by project `admin`**, not to the legacy `crafter-admin` deployment.
- The legacy project still exists and still has its own deployment URLs, but it is no longer the active public entrypoint.

Observed from `vercel domains ls`:

- No custom domains configured in this Vercel scope yet.

## Critical env vars for the canonical project

The canonical `admin` project must keep, at minimum:

- `DATABASE_URL`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` / `AUTH_URL` → should remain aligned to the public production URL

Current runtime validation from `/login` shows cookies are being issued with callback URL:

- `https://crafter-admin.vercel.app`

So the current public auth base is still correct for production traffic.

## Tangible step completed today

This consolidation doc was added to the repo to make the cutover state explicit and auditable.

Additionally, validation confirmed that the effective cutover of the public alias has **already happened**:

- public URL kept: `https://crafter-admin.vercel.app`
- backing deployment now comes from canonical project: **`admin`**
- legacy project kept only as fallback / retirement candidate

## Final cutover plan

### Keep

- Keep **`admin`** as the only canonical Vercel project for the admin app.

### Retire later

- Keep **`crafter-admin`** temporarily only as a rollback source.
- Do **not** delete it until final validation + env parity + optional custom domain migration are complete.

### Desired steady state

1. `admin` remains linked to `apps/admin`
2. Public admin traffic resolves to deployments from `admin`
3. Optional future custom domain (e.g. `admin.craftertires.com`) is attached to `admin`
4. `NEXTAUTH_URL` / `AUTH_URL` are updated only when the public domain changes
5. `crafter-admin` project is deleted only after a clean observation window

## Rollback plan

If a post-cutover regression appears:

1. Repoint `crafter-admin.vercel.app` back to the last known-good `crafter-admin` deployment
2. Re-validate `/login`, `/admin`, and auth cookie callback URL
3. Keep `admin` intact while debugging

Because the legacy project still exists, rollback remains possible without rebuilding it first.

## Validation completed

### Public login page

Validated URLs:

- `https://crafter-admin.vercel.app/login`
- `https://admin-ten-beta-78.vercel.app/login`
- `https://admin-skullbys-projects.vercel.app/login`

Observed on all of them:

- HTTP `200`
- page title: `Admin Crafter Tires`
- login copy present: `Ingresa con tu cuenta de administrador o manager.`
- auth callback cookie points to `https://crafter-admin.vercel.app`

### Functional implication

- The public URL serves the correct admin app.
- Login bootstrap is intact.
- The `/admin` area should remain protected by auth as before; no visible routing break was introduced by the alias state.

## Pending before deleting `crafter-admin`

1. Confirm env parity in Vercel UI/CLI between `admin` and `crafter-admin` for production secrets
2. Optionally attach final custom domain to `admin`
3. Observe production with `admin` as backend for the public alias
4. Remove legacy aliases / project only after that observation window

## Retirement note

> `crafter-admin` is now considered a **legacy Vercel project and retirement candidate**. It should not receive new product changes unless needed for emergency rollback.
