"use server";

import "./load-env";

import { revalidatePath } from "next/cache";
import { productInputSchema } from "@crafter/database";
import { auth, signOut } from "./auth";
import { prisma } from "@crafter/database";
import { z } from "zod";
import { revalidateStorefrontProducts } from "./storefront-revalidation";

async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
  return session.user as { role: "ADMIN" | "MANAGER" };
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Solo admin puede ejecutar esta acci�n");
  }
  return user;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function createProductAction(formData: FormData) {
  await requireUser();

  const parsed = productInputSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    price: formData.get("price"),
    previousPrice: formData.get("previousPrice") || null,
    discountPercentage: formData.get("discountPercentage") || null,
    width: formData.get("width"),
    height: formData.get("height"),
    rim: formData.get("rim"),
    vehicleType: formData.get("vehicleType"),
    runFlat: formData.get("runFlat") === "on",
    featured: formData.get("featured") === "on",
    active: formData.get("active") !== "off",
    stock: formData.get("stock"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl"),
    technicalDetails: {
      indiceCarga: String(formData.get("indiceCarga") || "N/A"),
      indiceVelocidad: String(formData.get("indiceVelocidad") || "N/A")
    }
  });

  await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      sku: parsed.sku,
      description: parsed.description,
      price: parsed.price,
      previousPrice: parsed.previousPrice,
      discountPercentage: parsed.discountPercentage,
      width: parsed.width,
      height: parsed.height,
      rim: parsed.rim,
      vehicleType: parsed.vehicleType,
      runFlat: parsed.runFlat,
      featured: parsed.featured,
      active: parsed.active,
      brandId: parsed.brandId,
      categoryId: parsed.categoryId,
      technicalDetails: parsed.technicalDetails,
      images: {
        create: [{ url: parsed.imageUrl, alt: parsed.name }]
      },
      inventory: {
        create: {
          stock: parsed.stock,
          movements: {
            create: {
              change: parsed.stock,
              reason: "ADMIN_CREATE",
              note: "Carga inicial"
            }
          }
        }
      }
    }
  });

  revalidatePath("/productos");
  await revalidateStorefrontProducts();
}

export async function updateProductAction(formData: FormData) {
  await requireUser();

  const id = String(formData.get("id"));
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";

  await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId: id } });

    if (inventory) {
      const diff = stock - inventory.stock;
      if (diff !== 0) {
        await tx.inventory.update({ where: { id: inventory.id }, data: { stock } });
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            change: diff,
            reason: "ADMIN_UPDATE",
            note: "Ajuste manual desde productos"
          }
        });
      }
    } else {
      await tx.inventory.create({
        data: {
          productId: id,
          stock,
          movements: {
            create: {
              change: stock,
              reason: "ADMIN_UPDATE",
              note: "Inventario creado desde productos"
            }
          }
        }
      });
    }

    await tx.product.update({
      where: { id },
      data: {
        price,
        featured,
        active
      }
    });
  });

  revalidatePath("/productos");
  revalidatePath("/");
  await revalidateStorefrontProducts();
}

export async function updateProductDetailsAction(formData: FormData) {
  await requireUser();

  const id = String(formData.get("id"));
  const parsed = productInputSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    price: formData.get("price"),
    previousPrice: formData.get("previousPrice") || null,
    discountPercentage: formData.get("discountPercentage") || null,
    width: formData.get("width"),
    height: formData.get("height"),
    rim: formData.get("rim"),
    vehicleType: formData.get("vehicleType"),
    runFlat: formData.get("runFlat") === "on",
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    stock: formData.get("stock"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl"),
    technicalDetails: {
      indiceCarga: "N/A",
      indiceVelocidad: "N/A"
    }
  });

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      include: { inventory: true, images: { orderBy: { order: "asc" }, take: 1 } }
    });
    if (!product) {
      throw new Error("Producto no encontrado");
    }

    await tx.product.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        sku: parsed.sku,
        description: parsed.description,
        price: parsed.price,
        previousPrice: parsed.previousPrice,
        discountPercentage: parsed.discountPercentage,
        width: parsed.width,
        height: parsed.height,
        rim: parsed.rim,
        vehicleType: parsed.vehicleType,
        runFlat: parsed.runFlat,
        featured: parsed.featured,
        active: parsed.active,
        brandId: parsed.brandId,
        categoryId: parsed.categoryId
      }
    });

    if (product.images[0]) {
      await tx.productImage.update({
        where: { id: product.images[0].id },
        data: { url: parsed.imageUrl, alt: parsed.name }
      });
    } else {
      await tx.productImage.create({
        data: { productId: id, url: parsed.imageUrl, alt: parsed.name, order: 0 }
      });
    }

    if (product.inventory) {
      const diff = parsed.stock - product.inventory.stock;
      if (diff !== 0) {
        await tx.inventory.update({
          where: { id: product.inventory.id },
          data: { stock: parsed.stock }
        });
        await tx.inventoryMovement.create({
          data: {
            inventoryId: product.inventory.id,
            change: diff,
            reason: "ADMIN_EDIT",
            note: "Edicion completa de producto"
          }
        });
      }
    } else {
      await tx.inventory.create({
        data: {
          productId: id,
          stock: parsed.stock,
          movements: {
            create: {
              change: parsed.stock,
              reason: "ADMIN_EDIT",
              note: "Inventario creado desde edicion completa"
            }
          }
        }
      });
    }
  });

  revalidatePath("/productos");
  revalidatePath(`/productos/${id}/editar`);
  revalidatePath("/catalogo");
  await revalidateStorefrontProducts();
}

export async function archiveProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.product.update({ where: { id }, data: { active: false } });
  revalidatePath("/productos");
  await revalidateStorefrontProducts();
}

export async function adjustStockAction(formData: FormData) {
  await requireUser();
  const productId = String(formData.get("productId"));
  const change = Number(formData.get("change"));
  const note = String(formData.get("note") || "Ajuste manual");

  await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId } });
    if (!inventory) throw new Error("Inventario no encontrado");

    await tx.inventory.update({
      where: { id: inventory.id },
      data: { stock: { increment: change } }
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        change,
        reason: "MANUAL_ADJUSTMENT",
        note
      }
    });
  });

  revalidatePath("/inventario");
  revalidatePath("/catalogo");
  await revalidateStorefrontProducts();
}

const simpleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  active: z.boolean().default(true)
});

export async function saveCategoryAction(formData: FormData) {
  await requireUser();
  const parsed = simpleSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    active: formData.get("active") === "on"
  });

  if (parsed.id) {
    await prisma.category.update({
      where: { id: parsed.id },
      data: { name: parsed.name, slug: parsed.slug, active: parsed.active }
    });
  } else {
    await prisma.category.create({ data: { name: parsed.name, slug: parsed.slug, active: true } });
  }

  revalidatePath("/categorias");
}

export async function saveBrandAction(formData: FormData) {
  await requireUser();
  const parsed = simpleSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    active: formData.get("active") === "on"
  });

  if (parsed.id) {
    await prisma.brand.update({
      where: { id: parsed.id },
      data: { name: parsed.name, slug: parsed.slug, active: parsed.active }
    });
  } else {
    await prisma.brand.create({ data: { name: parsed.name, slug: parsed.slug, active: true } });
  }

  revalidatePath("/marcas");
}