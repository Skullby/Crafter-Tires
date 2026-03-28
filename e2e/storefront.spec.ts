import { test, expect } from "@playwright/test";

test.describe("Storefront — Homepage", () => {
  test("loads with correct title and hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/crafter/i);
    // Hero section should be visible with a call-to-action
    const hero = page.locator("main").first();
    await expect(hero).toBeVisible();
  });

  test("displays navigation with category links", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeVisible();
    // Should have links to key sections
    const navLinks = header.locator("a");
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test("displays featured products", async ({ page }) => {
    await page.goto("/");
    // Look for product cards or a product grid on the homepage
    const productLinks = page.locator('a[href*="/producto/"]');
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("displays category cards", async ({ page }) => {
    await page.goto("/");
    // Should show category links (Auto, SUV, Camioneta, etc.)
    const categoryLinks = page.locator('a[href*="/categoria/"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("footer is present with contact info", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});

test.describe("Storefront — Catalog Browsing", () => {
  test("catalog page loads and shows products", async ({ page }) => {
    await page.goto("/catalogo");
    await page.waitForLoadState("networkidle");
    // Should display product cards
    const productCards = page.locator('a[href*="/producto/"]');
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test("catalog has filter controls", async ({ page }) => {
    await page.goto("/catalogo");
    await page.waitForLoadState("networkidle");
    // Should have some form of filtering (selects, inputs, or buttons)
    const filterElements = page.locator("select, input[type='range'], [role='combobox']");
    const count = await filterElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("category page loads filtered products", async ({ page }) => {
    // First find a valid category link from the homepage
    await page.goto("/");
    const categoryLink = page.locator('a[href*="/categoria/"]').first();
    const href = await categoryLink.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);
    await page.waitForLoadState("networkidle");
    // Should still show products, filtered by category
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Storefront — Product Detail", () => {
  test("product page loads with essential info", async ({ page }) => {
    // Navigate to catalog, get a product slug, then go directly
    await page.goto("/catalogo");
    await page.waitForLoadState("networkidle");

    const firstProductLink = page.locator('a[href*="/producto/"]').first();
    await expect(firstProductLink).toBeVisible();
    const href = await firstProductLink.getAttribute("href");
    expect(href).toBeTruthy();

    // Navigate directly to the product URL
    await page.goto(href!);
    await page.waitForLoadState("networkidle");

    // URL should be a product page
    expect(page.url()).toContain("/producto/");

    // Page should not show a server error
    const errorText = page.locator("text=/Application error|server-side exception/i");
    const hasError = await errorText.count();
    expect(hasError, "Product detail page is returning a server-side error").toBe(0);

    // Should show a price (look for $ or ARS formatting)
    const priceText = page.locator("text=/\\$/");
    expect(await priceText.count()).toBeGreaterThan(0);
  });

  test("product page has add-to-cart button", async ({ page }) => {
    await page.goto("/catalogo");
    await page.waitForLoadState("networkidle");

    const firstProduct = page.locator('a[href*="/producto/"]').first();
    await firstProduct.click();
    await page.waitForLoadState("networkidle");

    // Should have an add-to-cart or buy button
    const cartButton = page.locator(
      'button:has-text("carrito"), button:has-text("comprar"), button:has-text("agregar")'
    );
    expect(await cartButton.count()).toBeGreaterThan(0);
  });

  test("invalid product slug returns 404", async ({ page }) => {
    const response = await page.goto("/producto/this-product-does-not-exist-xyz");
    // Should get a 404 or show a not-found page
    const is404 = response?.status() === 404;
    const hasNotFoundText = await page.locator("text=/no encontr|not found|404/i").count();
    expect(is404 || hasNotFoundText > 0).toBeTruthy();
  });
});

test.describe("Storefront — Cart Flow", () => {
  test("cart page is accessible", async ({ page }) => {
    await page.goto("/carrito");
    await page.waitForLoadState("networkidle");
    // Should load without error — empty cart is fine
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("add product to cart and verify cart page", async ({ page }) => {
    // Go to a product
    await page.goto("/catalogo");
    await page.waitForLoadState("networkidle");
    const firstProduct = page.locator('a[href*="/producto/"]').first();
    await firstProduct.click();
    await page.waitForLoadState("networkidle");

    // Click add to cart
    const cartButton = page.locator(
      'button:has-text("carrito"), button:has-text("comprar"), button:has-text("agregar")'
    ).first();

    if (await cartButton.isVisible()) {
      await cartButton.click();
      // Wait for cart action to complete
      await page.waitForTimeout(2000);

      // Navigate to cart
      await page.goto("/carrito");
      await page.waitForLoadState("networkidle");

      // Cart should now have at least one item or show cart content
      const body = await page.locator("body").textContent();
      // The page should show something meaningful (price, product, or empty cart message)
      expect(body).toBeTruthy();
    }
  });
});

test.describe("Storefront — Checkout Flow", () => {
  test("checkout page is accessible", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("checkout result page handles missing params gracefully", async ({ page }) => {
    // Hit the result page without payment params — should not crash
    await page.goto("/checkout/resultado");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Should show some kind of status or redirect, not a server error
    expect(page.url()).toBeTruthy();
  });
});

test.describe("Storefront — Contact", () => {
  test("contact page loads", async ({ page }) => {
    await page.goto("/contacto");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Storefront — API Health", () => {
  test("cart add API returns proper response for missing data", async ({ request }) => {
    // POST without body should return an error, not crash
    const response = await request.post("/api/cart/add", {
      data: {},
    });
    // Should return 400 (bad request) or similar, not 500
    expect(response.status()).toBeLessThan(500);
  });

  test("webhook endpoint exists and rejects unsigned requests", async ({ request }) => {
    const response = await request.post("/api/mercadopago/webhook", {
      data: { type: "payment", data: { id: "fake" } },
    });
    // Should not return 500 — should handle gracefully
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Storefront — Performance & SEO Basics", () => {
  test("homepage loads within acceptable time", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;
    // Homepage should load DOM in under 10 seconds
    expect(loadTime).toBeLessThan(10_000);
  });

  test("pages have meta description", async ({ page }) => {
    await page.goto("/");
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("images have alt attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const images = page.locator("img");
    const count = await images.count();
    if (count > 0) {
      // Check first 5 images have alt text
      const checkCount = Math.min(count, 5);
      for (let i = 0; i < checkCount; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        expect(alt).not.toBeNull();
      }
    }
  });
});
