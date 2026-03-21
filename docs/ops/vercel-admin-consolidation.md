# Crafter Tires Admin — Vercel consolidation state

_Last updated: 2026-03-20 UTC_

## Executive summary

- **Canonical admin project:** `admin`
- **Legacy / retirement candidate:** `crafter-admin`
- **Current public admin URL:** `https://crafter-admin.vercel.app`
- **Target production domain:** `https://admin.craftertires.com` (new custom domain that will sit on `admin` once the DNS alias is wired)
- **Current routing status:** `crafter-admin.vercel.app` is already aliased to a deployment from the **`admin`** project.
- **Custom domains:** none configured yet in Vercel; the operations below describe how to attach `admin.craftertires.com` to the canonical project.

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
- The legacy project still exists but no longer owns the production URL. `admin.craftertires.com` will become a second alias once it is attached to `admin`.

Observed from `vercel domains ls`:

- No custom domains configured in this Vercel scope yet.

## Critical env vars for the canonical project

The canonical `admin` project must keep, at minimum:

- `DATABASE_URL`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` / `AUTH_URL` → must match the public production domain (`https://admin.craftertires.com` once the custom domain is ready)
- `NEXT_PUBLIC_PROD_ADMIN_URL` → share the same domain for UI links and banners
- `NEXT_PUBLIC_SHOW_STAGING_BANNER` → keep set to `false` so the production UI never surfaces the old staging banner

Current runtime validation from `/login` shows cookies are being issued with callback URL:

- `https://crafter-admin.vercel.app`

The next rollout will continue to honor that while the DNS change propagates, but the goal for the cutover is to switch those cookies to `https://admin.craftertires.com`.

## Tangible step completed today

- Documented the consolidation state in repo so the cutover is auditable and repeatable.
- Cleared the staging-focused banner/labels and tightened the auth secret handling so the `admin` build now assumes production-level secrets and no longer leaks a staging fallback.
- Confirmed the public alias still points at the `admin` project deployment.

## Final cutover plan

1. Keep **`admin`** as the only canonical Vercel project for the admin app.
2. `crafter-admin` stays temporarily only as a rollback source.
3. `admin.craftertires.com` becomes the authoritative URL (see checklist below).
4. `NEXTAUTH_URL` / `AUTH_URL` are updated only when the public domain changes.
5. Delete the legacy project only after a clean observation window.

## Custom domain activation checklist

1. `vercel domains add admin.craftertires.com --project admin`
2. Create the appropriate DNS record (`CNAME admin.craftertires.com cname.vercel-dns.com` or the value provided by Vercel) and wait for the domain to show as `configured` in Vercel.
3. Alias the domain to the latest `admin` deployment: `vercel alias admin.craftertires.com admin`
4. Update the environment variables in Vercel for the `admin` project so that `NEXTAUTH_URL`, `AUTH_URL`, and `NEXT_PUBLIC_PROD_ADMIN_URL` equal `https://admin.craftertires.com` and `NEXT_PUBLIC_SHOW_STAGING_BANNER=false`.
5. Pull the updated env file (`vercel env pull apps/admin/.env.production.pull`) and ensure local and CI math the new domain.
6. Trigger a new `admin` deployment (the build already runs the same command, so just redeploy) and confirm `https://admin.craftertires.com/login` responds with `200` and cookies reference the new base URL.
7. Re-validate `/api/auth/session` after login to ensure the session payload still returns the expected user info and the cookie path is consistent.
8. Once `admin.craftertires.com` is stable for a few hours, you can retire the `crafter-admin` project.

## Rollback plan

If a post-cutover regression appears:

1. Repoint `crafter-admin.vercel.app` back to the last known-good `crafter-admin` deployment.
2. Re-validate `/login`, `/admin`, and auth cookie callback URL.
3. Keep `admin` intact while debugging.

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
- The `/admin` area remains protected by auth as before; no visible routing break was introduced by the alias state.

## Pending before deleting `crafter-admin`

1. Confirm env parity in Vercel UI/CLI between `admin` and `crafter-admin` for production secrets.
2. Optionally attach final custom domain to `admin` (see checklist above).
3. Observe production with `admin` as backend for the public alias.
4. Remove legacy aliases / project only after that observation window.

## Retirement note

> `crafter-admin` is now considered a **legacy Vercel project and retirement candidate**. It should not receive new product changes unless needed for emergency rollback.
