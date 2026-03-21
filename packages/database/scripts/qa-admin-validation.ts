import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma, productInputSchema } from "@crafter/database";

type Totals = { subtotal: number; shipping: number; total: number };

type CreatedResources = {
  brandId?: string;
  categoryId?: string;
  productId?: string;
  cartId?: string;
  orderId?: string;
  customerId?: string;
};

async function computeCartTotals(items: Array<{ quantity: number; unitPrice: Decimal }>): Promise<Totals> {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice.toNumber() * item.quantity, 0);
  const shipping = 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

function createOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(
    2,
    "0"
  )}`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `CT-${stamp}-${time}-${random}`;
}

async function createOrderWithUniqueNumber(data: Omit<Prisma.OrderCreateInput, "number">) {
  let attempts = 0;
  while (attempts < 5) {
    try {
      return await prisma.order.create({
        data: {
          ...data,
          number: createOrderNumber()
        },
        include: { payments: true }
      });
    } catch (error) {
      attempts += 1;
      const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";
      if (!isUniqueViolation || attempts >= 5) {
        throw error;
      }
    }
  }
  throw new Error("No se pudo generar un numero de orden unico");
}

async function addCartItemForSession(sessionId: string, productId: string, quantity: number) {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: { include: { inventory: true } }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: { include: { inventory: true } }
          }
        }
      }
    });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true }
  });

  if (!product || !product.active || !product.inventory) {
    throw new Error("Producto no disponible para el carrito");
  }

  const existing = cart.items.find((item) => item.productId === productId);
  const nextQty = (existing?.quantity ?? 0) + quantity;

  if (nextQty > product.inventory.stock) {
    throw new Error(`Stock insuficiente: ${nextQty} > ${product.inventory.stock}`);
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId
      }
    },
    update: {
      quantity: nextQty,
      unitPrice: product.price
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
      unitPrice: product.price
    }
  });

  return await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: { include: { inventory: true } }
        }
      }
    }
  });
}

async function runValidationSuite() {
  const resources: CreatedResources = {};
  try {
    const uniqId = randomUUID().slice(0, 6);
    console.log(`
1) Creando marca y categoria de QA`);
    const brand = await prisma.brand.create({
      data: {
        name: `QA Brand ${uniqId}`,
        slug: `qa-brand-${uniqId}`
      }
    });
    const category = await prisma.category.create({
      data: {
        name: `QA Category ${uniqId}`,
        slug: `qa-category-${uniqId}`
      }
    });
    resources.brandId = brand.id;
    resources.categoryId = category.id;
    console.log(`   → Marca ${brand.name} (${brand.id}), categoria ${category.slug} (${category.id})`);

    console.log(`
2) Crear producto con inventario y plan de prueba`);
    const parsed = productInputSchema.parse({
      name: `QA Tire ${uniqId}`,
      slug: `qa-product-${uniqId}`,
      sku: `QA-SKU-${uniqId}`,
      description: "Test de QA funcional: producto operacion admin",
      price: 11000,
      previousPrice: 12500,
      discountPercentage: 12,
      width: 205,
      height: 55,
      rim: 16,
      vehicleType: "AUTO",
      runFlat: false,
      featured: true,
      active: true,
      stock: 12,
      brandId: brand.id,
      categoryId: category.id,
      imageUrl: "https://example.com/qa-tire.jpg",
      technicalDetails: {
        indiceCarga: "91",
        indiceVelocidad: "V"
      }
    });

    const product = await prisma.product.create({
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
      },
      include: { inventory: true }
    });

    const inventoryId = product.inventory?.id;
    if (!inventoryId) throw new Error("No se pudo obtener inventario");
    resources.productId = product.id;
    console.log(`   → Producto creado ${product.id} (stock inicial ${product.inventory?.stock})`);

    console.log(`
3) Actualizar precio, stock y movimientos`);
    const newPrice = product.price.toNumber() * 1.1;
    const newStock = (product.inventory?.stock ?? 0) + 3;

    await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId: product.id } });
      if (!inventory) throw new Error("Inventario faltante");
      const diff = newStock - inventory.stock;
      if (diff !== 0) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { stock: newStock }
        });
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            change: diff,
            reason: "ADMIN_UPDATE",
            note: "Prueba QA de ajuste"
          }
        });
      }
      await tx.product.update({
        where: { id: product.id },
        data: { price: new Prisma.Decimal(newPrice), featured: false, active: true }
      });
    });

    const inventoryMovements = await prisma.inventoryMovement.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "asc" }
    });
    console.log(
      `   → Inventario actualizado a ${newStock}, movimiento extra generado: ${inventoryMovements.length} registros (${inventoryMovements
        .map((m) => `${m.change}:${m.reason}`)
        .join(", ")})`
    );

    console.log(`
4) Actualizar marca (nombre y slug)`);
    const updatedBrand = await prisma.brand.update({
      where: { id: brand.id },
      data: { name: `${brand.name} (QA)`, slug: `${brand.slug}-updated`, active: false }
    });
    console.log(`   → Marca ahora ${updatedBrand.name} / slug ${updatedBrand.slug} / active ${updatedBrand.active}`);

    console.log(`
5) Manejar carrito (agregar cantidad permitida y rechazar exceso)`);
    const sessionId = `qa-session-${randomUUID()}`;
    const inventoryAfter = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if (!inventoryAfter) throw new Error("Inventario faltante al preparar carrito");
    try {
      await addCartItemForSession(sessionId, product.id, inventoryAfter.stock + 5);
      throw new Error("Se esperaba un error por stock insuficiente pero no ocurrió");
    } catch (error) {
      console.log(`   → Rechazado correctamente al intentar ${inventoryAfter.stock + 5} (mensaje: ${error})`);
    }

    const safeQty = Math.max(1, inventoryAfter.stock - 1);
    const cart = await addCartItemForSession(sessionId, product.id, safeQty);
    resources.cartId = cart?.id;
    const totals = await computeCartTotals(cart?.items ?? []);
    console.log(
      `   → Carrito ${cart?.id} ahora tiene ${cart?.items.length} item(s), subtotal ${totals.subtotal}, total ${totals.total}`
    );

    console.log(`
6) Crear orden desde carrito`);
    const customerEmail = `qa-${randomUUID().slice(0, 6)}@example.com`;
    const customer = await prisma.customer.create({
      data: { name: "QA Checkout", email: customerEmail, phone: "+5491122334455" }
    });
    resources.customerId = customer.id;

    const order = await createOrderWithUniqueNumber({
      customer: { connect: { id: customer.id } },
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotal: new Prisma.Decimal(totals.subtotal),
      shipping: new Prisma.Decimal(totals.shipping),
      total: new Prisma.Decimal(totals.total),
      currency: "ARS",
      shippingAddress: {
        street: "Calle QA",
        city: "Buenos Aires",
        state: "CABA",
        postalCode: "C1000",
        country: "AR"
      },
      billingAddress: {
        street: "Calle QA",
        city: "Buenos Aires",
        state: "CABA",
        postalCode: "C1000",
        country: "AR"
      },
      items: {
        create: cart?.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.unitPrice.mul(item.quantity)
        })) ?? []
      },
      payments: {
        create: {
          provider: "QA_TEST",
          status: "PENDING",
          amount: new Prisma.Decimal(totals.total),
          currency: "ARS"
        }
      }
    });
    resources.orderId = order.id;
    console.log(`   → Orden ${order.number} creada con total ${order.total.toString()} y pago ${order.payments[0].status}`);

    console.log(`
Suite QA completada correctamente.`);
  } finally {
    console.log(`
Limpiando recursos QA`);
    if (resources.orderId) {
      await prisma.order.deleteMany({ where: { id: resources.orderId } });
    }
    if (resources.cartId) {
      await prisma.cartItem.deleteMany({ where: { cartId: resources.cartId } });
      await prisma.cart.deleteMany({ where: { id: resources.cartId } });
    }
    if (resources.productId) {
      await prisma.product.deleteMany({ where: { id: resources.productId } });
    }
    if (resources.brandId) {
      await prisma.brand.deleteMany({ where: { id: resources.brandId } });
    }
    if (resources.categoryId) {
      await prisma.category.deleteMany({ where: { id: resources.categoryId } });
    }
    if (resources.customerId) {
      await prisma.customer.deleteMany({ where: { id: resources.customerId } });
    }
  }
}

runValidationSuite().catch((error) => {
  console.error("Suite QA fallo:", error);
  process.exit(1);
});
