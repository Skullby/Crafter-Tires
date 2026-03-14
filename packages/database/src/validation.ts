import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  sku: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  previousPrice: z.coerce.number().positive().nullable().optional(),
  discountPercentage: z.coerce.number().int().min(0).max(100).nullable().optional(),
  width: z.coerce.number().int().min(100),
  height: z.coerce.number().int().min(20),
  rim: z.coerce.number().int().min(10),
  vehicleType: z.enum(["AUTO", "SUV", "CAMIONETA", "UTILITARIO"]),
  runFlat: z.boolean().default(false),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  stock: z.coerce.number().int().min(0),
  brandId: z.string().cuid(),
  categoryId: z.string().cuid(),
  imageUrl: z.string().url(),
  technicalDetails: z.record(z.string()).optional()
});

export const checkoutSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(6),
  shippingAddress: z.object({
    street: z.string().min(4),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().default("AR")
  }),
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: z
    .object({
      street: z.string().min(4),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(3),
      country: z.string().default("AR")
    })
    .optional()
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
