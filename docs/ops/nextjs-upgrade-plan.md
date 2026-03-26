# Next.js Upgrade Plan

Created: 2026-03-26
Status: **Pending approval**

## Problem

Next.js 14.2.17 has a known security vulnerability:
> "This version has a security vulnerability. Please upgrade to a patched version."
> See: https://nextjs.org/blog/security-update-2025-12-11

CI reports this deprecation on every run.

## Current state

- Both `apps/storefront` and `apps/admin` use `next@14.2.17`
- Root devDependencies also pins `next@14.2.17`
- React version: 18.3.1

## Upgrade options

### Option A: Patch only (14.2.x → 14.2.29+)
- **Risk:** Minimal — same major/minor
- **Effort:** Low — likely just `pnpm update next`
- **Benefit:** Fixes the CVE, no breaking changes
- **Downside:** Still on Next 14 which is approaching EOL

### Option B: Next 15 upgrade
- **Risk:** Medium — App Router API changes, React 19 migration
- **Effort:** Medium — need to test all routes, middleware, auth
- **Breaking changes to check:**
  - `next/headers` and `next/cookies` became async in Next 15
  - `params` in page/layout/route handlers became async
  - NextAuth v5 beta compatibility with Next 15
  - Turbopack may behave differently
- **Benefit:** Current stable, React 19, longer support window

### Option C: Next 16 (latest)
- **Risk:** High — very new, major version jump
- **Not recommended** for a production commerce site right now

## Recommendation

**Start with Option A** (patch to 14.2.29+) to fix the CVE immediately.
Then plan Option B (Next 15) as a separate tracked task when there's bandwidth.

## Execution plan for Option A

```bash
cd /home/skullby/skullby-software/workspace/Crafter-Tires

# Update Next.js to latest 14.x patch
pnpm update next@^14.2.29

# Verify
pnpm lint
pnpm typecheck
AUTH_SECRET=dev-secret pnpm build
pnpm test
pnpm test:e2e  # if Playwright browsers are installed

# If all pass, commit and push
git add -A
git commit -m "fix(deps): upgrade Next.js 14.2.17 → 14.2.x (CVE fix)"
git push origin main

# Verify CI
gh run list --limit 1
node scripts/verify-deploy.mjs
```

## Agents involved

- `devops-automator` — execute the upgrade and verify CI
- `frontend-developer` — validate UI behavior if build passes but runtime issues appear
- `code-reviewer` — review the diff before push
- `api-tester` — validate API routes still work post-upgrade
