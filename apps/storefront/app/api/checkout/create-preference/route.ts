import { NextResponse } from "next/server";
import {
  prisma,
  Prisma,
  checkoutSchema,
  reserveStock,
  releaseStock,
  InsufficientStockError,
} from "@crafter/database";
import { clearCart, computeCartTotals, getCart } from "../../../../lib/cart";
import { createMercadoPagoPreference } from "../../../../lib/mercadopago";
import { attachSessionCookie } from "../../../../lib/session";

function createOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `CT-${stamp}-${time}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = checkoutSchema.parse(body);

    const cart = await getCart();
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "El carrito esta vacio" }, { status: 400 });
    }

    const customer = await prisma.customer.upsert({
      where: { email: payload.email },
      update: { name: payload.name, phone: payload.phone },
      create: { name: payload.name, email: payload.email, phone: payload.phone },
    });

    const totals = computeCartTotals(cart.items);

    // Create order AND reserve stock in a single transaction.
    // The conditional updateMany(stock >= qty) per item prevents oversell
    // under concurrency — only one transaction can win the stock.
    const order = await prisma.$transaction(async (tx) => {
      let attempts = 0;
      let created: Prisma.OrderGetPayload<{ include: { payments: true } }> | undefined;

      while (attempts < 5) {
        try {
          created = await tx.order.create({
            data: {
              number: createOrderNumber(),
              customer: { connect: { id: customer.id } },
              status: "PENDING",
              paymentStatus: "PENDING",
              subtotal: totals.subtotal,
              shipping: totals.shipping,
              total: totals.total,
              shippingAddress: payload.shippingAddress,
              billingAddress: payload.billingSameAsShipping
                ? payload.shippingAddress
                : payload.billingAddress,
              items: {
                create: cart.items.map((item) => ({
                  productId: item.productId,
                  name: item.product.name,
                  sku: item.product.sku,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  total: item.unitPrice.mul(item.quantity),
                })),
              },
              payments: {
                create: {
                  provider: "MERCADOPAGO",
                  status: "PENDING",
                  amount: totals.total,
                  currency: "ARS",
                },
              },
            },
            include: { payments: true },
          });
          break;
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

      if (!created) {
        throw new Error("No se pudo generar un numero de orden unico");
      }

      // Reserve stock atomically — concurrent checkouts will fail here
      // if stock is insufficient thanks to the conditional updateMany.
      await reserveStock(
        tx,
        created.id,
        cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      return created;
    });

    try {
      const preference = await createMercadoPagoPreference({
        orderId: order.id,
        orderNumber: order.number,
        amount: totals.total,
        title: `Orden ${order.number}`,
        payerEmail: payload.email,
      });

      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          providerPreferenceId: preference.id,
          rawPayload: preference,
        },
      });

      await clearCart();

      return attachSessionCookie(
        NextResponse.json({
          orderId: order.id,
          initPoint: preference.init_point,
          sandboxInitPoint: preference.sandbox_init_point,
        })
      );
    } catch (error) {
      // MP preference creation failed — release reserved stock
      await prisma.$transaction(async (tx) => {
        await releaseStock(tx, order.id);

        await tx.payment.update({
          where: { id: order.payments[0].id },
          data: {
            status: "FAILED",
            rawPayload: {
              message:
                error instanceof Error
                  ? error.message
                  : "Mercado Pago preference error",
            },
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELED",
            paymentStatus: "FAILED",
            notes: "No se pudo crear la preferencia de pago.",
          },
        });
      });

      return NextResponse.json(
        { error: "No se pudo iniciar el pago." },
        { status: 502 }
      );
    }
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json(
        { error: "Stock insuficiente para uno o mas productos del carrito" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "No se pudo iniciar el checkout" },
      { status: 400 }
    );
  }
}
