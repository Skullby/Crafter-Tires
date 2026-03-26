#!/usr/bin/env node

/**
 * Post-deploy verification script.
 * Checks that deployed URLs respond correctly.
 *
 * Usage:
 *   node scripts/verify-deploy.mjs                    # check all known URLs
 *   node scripts/verify-deploy.mjs https://custom.url # check a specific URL
 */

const TARGETS = [
  {
    name: "Storefront",
    url: "https://storefront-seven-tan.vercel.app",
    checks: [
      { desc: "returns 200", test: (res) => res.status === 200 },
      { desc: "has HTML content", test: (res, body) => body.includes("</html>") },
    ],
  },
];

const customUrl = process.argv[2];
if (customUrl) {
  TARGETS.push({
    name: `Custom (${customUrl})`,
    url: customUrl,
    checks: [
      { desc: "returns 200", test: (res) => res.status === 200 },
    ],
  });
}

let exitCode = 0;

for (const target of TARGETS) {
  console.log(`\n--- ${target.name}: ${target.url} ---`);
  try {
    const res = await fetch(target.url, {
      redirect: "follow",
      headers: { "User-Agent": "crafter-deploy-verify/1.0" },
    });
    const body = await res.text();

    for (const check of target.checks) {
      const passed = check.test(res, body);
      const icon = passed ? "✓" : "✗";
      console.log(`  ${icon} ${check.desc} (status: ${res.status})`);
      if (!passed) exitCode = 1;
    }
  } catch (err) {
    console.log(`  ✗ fetch failed: ${err.message}`);
    exitCode = 1;
  }
}

console.log(exitCode === 0 ? "\n✓ All checks passed" : "\n✗ Some checks failed");
process.exit(exitCode);
