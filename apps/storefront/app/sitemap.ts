import type { MetadataRoute } from "next";
import { prisma } from "@crafter/database";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000";
  const products = await prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
  const categories = await prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/catalogo`, lastModified: new Date() },
    ...products.map((product) => ({
      url: `${base}/producto/${product.slug}`,
      lastModified: product.updatedAt
    })),
    ...categories.map((category) => ({
      url: `${base}/categoria/${category.slug}`,
      lastModified: category.updatedAt
    }))
  ];
}
