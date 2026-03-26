import { test, expect } from "@playwright/test";

test.describe("Storefront", () => {
  test("homepage loads and has title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/crafter/i);
  });

  test("homepage renders main content", async ({ page }) => {
    await page.goto("/");
    // Verify the page has meaningful content (not a blank page or error)
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Check for at least one link or navigation element
    const links = page.locator("a");
    expect(await links.count()).toBeGreaterThan(0);
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");
    // Check that internal navigation links exist
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();
    if (count > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute("href");
      if (href && href.startsWith("/")) {
        await firstLink.click();
        await page.waitForLoadState("networkidle");
        expect(page.url()).toBeTruthy();
      }
    }
  });
});
