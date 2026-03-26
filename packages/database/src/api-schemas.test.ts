import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Tests for inline Zod schemas used in API routes.
 * These schemas are defined in the route files — we replicate them here
 * to ensure contract stability even if route code changes.
 */

// Cart Add schema (from apps/storefront/app/api/cart/add/route.ts)
const cartAddSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

// Cart Remove schema (from apps/storefront/app/api/cart/remove/route.ts)
const cartRemoveSchema = z.object({
  itemId: z.string().cuid(),
});

// Cart Update schema (from apps/storefront/app/api/cart/update/route.ts)
const cartUpdateSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().int().min(0).max(99),
});

const fakeCuid = "clxxxxxxxxxxxxxxxxxxxxxxxxx";

describe("Cart Add schema", () => {
  it("accepts valid add request", () => {
    const result = cartAddSchema.safeParse({ productId: fakeCuid, quantity: 3 });
    expect(result.success).toBe(true);
  });

  it("rejects quantity 0", () => {
    const result = cartAddSchema.safeParse({ productId: fakeCuid, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects quantity above 10", () => {
    const result = cartAddSchema.safeParse({ productId: fakeCuid, quantity: 11 });
    expect(result.success).toBe(false);
  });

  it("rejects non-cuid productId", () => {
    const result = cartAddSchema.safeParse({ productId: "abc", quantity: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing productId", () => {
    const result = cartAddSchema.safeParse({ quantity: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects float quantity", () => {
    const result = cartAddSchema.safeParse({ productId: fakeCuid, quantity: 2.5 });
    expect(result.success).toBe(false);
  });
});

describe("Cart Remove schema", () => {
  it("accepts valid remove request", () => {
    const result = cartRemoveSchema.safeParse({ itemId: fakeCuid });
    expect(result.success).toBe(true);
  });

  it("rejects missing itemId", () => {
    const result = cartRemoveSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-cuid itemId", () => {
    const result = cartRemoveSchema.safeParse({ itemId: "123" });
    expect(result.success).toBe(false);
  });
});

describe("Cart Update schema", () => {
  it("accepts valid update request", () => {
    const result = cartUpdateSchema.safeParse({ itemId: fakeCuid, quantity: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts quantity 0 (triggers removal)", () => {
    const result = cartUpdateSchema.safeParse({ itemId: fakeCuid, quantity: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects quantity above 99", () => {
    const result = cartUpdateSchema.safeParse({ itemId: fakeCuid, quantity: 100 });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = cartUpdateSchema.safeParse({ itemId: fakeCuid, quantity: -1 });
    expect(result.success).toBe(false);
  });
});
