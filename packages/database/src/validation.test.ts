import { describe, it, expect } from "vitest";
import { productInputSchema, checkoutSchema } from "./validation";

describe("productInputSchema", () => {
  const validProduct = {
    name: "Neumático 205/55R16",
    slug: "neumatico-205-55-r16",
    sku: "CT-205-55-16",
    description: "Neumático radial para auto, excelente agarre",
    price: 85000,
    width: 205,
    height: 55,
    rim: 16,
    vehicleType: "AUTO" as const,
    stock: 10,
    brandId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    categoryId: "clyyyyyyyyyyyyyyyyyyyyyyyyy",
    imageUrl: "https://example.com/tire.jpg",
  };

  it("accepts valid product input", () => {
    const result = productInputSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = productInputSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = productInputSchema.safeParse({ ...validProduct, price: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid vehicle type", () => {
    const result = productInputSchema.safeParse({ ...validProduct, vehicleType: "MOTO" });
    expect(result.success).toBe(false);
  });

  it("coerces string price to number", () => {
    const result = productInputSchema.safeParse({ ...validProduct, price: "85000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(85000);
    }
  });

  it("defaults runFlat to false", () => {
    const result = productInputSchema.safeParse(validProduct);
    if (result.success) {
      expect(result.data.runFlat).toBe(false);
    }
  });

  it("rejects rim below 10", () => {
    const result = productInputSchema.safeParse({ ...validProduct, rim: 5 });
    expect(result.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const validCheckout = {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+5491155554444",
    shippingAddress: {
      street: "Av. Corrientes 1234",
      city: "CABA",
      state: "Buenos Aires",
      postalCode: "C1043",
    },
  };

  it("accepts valid checkout input", () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("defaults country to AR", () => {
    const result = checkoutSchema.safeParse(validCheckout);
    if (result.success) {
      expect(result.data.shippingAddress.country).toBe("AR");
    }
  });

  it("defaults billingSameAsShipping to true", () => {
    const result = checkoutSchema.safeParse(validCheckout);
    if (result.success) {
      expect(result.data.billingSameAsShipping).toBe(true);
    }
  });

  it("rejects invalid email", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects missing shipping address fields", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      shippingAddress: { street: "Av. Corrientes 1234" },
    });
    expect(result.success).toBe(false);
  });
});
