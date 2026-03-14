import { prisma } from "@crafter/database";
import type { VehicleType } from "@prisma/client";

export type CatalogFilters = {
  query?: string;
  brand?: string;
  width?: number;
  height?: number;
  rim?: number;
  vehicleType?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "price_asc" | "price_desc" | "bestsellers" | "recommended";
  categorySlug?: string;
};

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {
      active: true,
      featured: true
    },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" }, take: 1 },
      inventory: true
    },
    orderBy: [{ bestsellerScore: "desc" }, { createdAt: "desc" }],
    take: 8
  });
}

export async function getCategories() {
  return prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function getBrands() {
  return prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function getCatalogProducts(filters: CatalogFilters) {
  const orderBy =
    filters.sort === "price_asc"
      ? [{ price: "asc" as const }]
      : filters.sort === "price_desc"
        ? [{ price: "desc" as const }]
        : filters.sort === "bestsellers"
          ? [{ bestsellerScore: "desc" as const }]
          : [{ featured: "desc" as const }, { createdAt: "desc" as const }];

  return prisma.product.findMany({
    where: {
      active: true,
      category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
      name: filters.query ? { contains: filters.query, mode: "insensitive" } : undefined,
      brand: filters.brand ? { slug: filters.brand } : undefined,
      width: filters.width,
      height: filters.height,
      rim: filters.rim,
      vehicleType: filters.vehicleType,
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice
      },
      inventory: filters.inStock ? { stock: { gt: 0 } } : undefined
    },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" }, take: 1 },
      inventory: true
    },
    orderBy
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" } },
      specifications: true,
      inventory: true
    }
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, brandId: string) {
  return prisma.product.findMany({
    where: {
      active: true,
      id: { not: productId },
      OR: [{ categoryId }, { brandId }]
    },
    include: {
      brand: true,
      images: { take: 1, orderBy: { order: "asc" } },
      inventory: true
    },
    take: 4
  });
}
