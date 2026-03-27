import { NextResponse } from "next/server";
import { prisma, Prisma } from "@crafter/database";
import { checkoutSchema } from "@crafter/database";
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

type OrderCreateWithoutNumber = Omit<Prisma.OrderCreateInput, "number">;

async function createOrderWithUniqueNumber(data: OrderCreateWithoutNumber) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = checkoutSchema.parse(body);

    const cart = await getCart();
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "El carrito esta vacio" }, { status: 400 });
    }

    for (const item of cart.items) {
      const inventory = await prisma.inventory.findUnique({ where: { productId: item.productId } });
      if (!inventory || inventory.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${item.product.name}` }, { status: 400 });
      }
    }

    const customer = await prisma.customer.upsert({
      where: { email: payload.email },
      update: { name: payload.name, phone: payload.phone },
      create: { name: payload.name, email: payload.email, phone: payload.phone }
    });

    const totals = computeCartTotals(cart.items);

    const order = await createOrderWithUniqueNumber({
      customer: { connect: { id: customer.id } },
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingSameAsShipping ? payload.shippingAddress : payload.billingAddress,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.unitPrice.mul(item.quantity)
        }))
      },
      payments: {
        create: {
          provider: "MERCADOPAGO",
          status: "PENDING",
          amount: totals.total,
          currency: "ARS"
        }
      }
    });

    try {
      const preference = await createMercadoPagoPreference({
        orderId: order.id,
        orderNumber: order.number,
        amount: totals.total,
        title: `Orden ${order.number}`,
        payerEmail: payload.email
      });

      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          providerPreferenceId: preference.id,
          rawPayload: preference
        }
      });

      await clearCart();

      return attachSessionCookie(NextResponse.json({
        orderId: order.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
      }));
    } catch (error) {
      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          status: "FAILED",
          rawPayload: {
            message: error instanceof Error ? error.message : "Mercado Pago preference error"
          }
        }
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELED",
          paymentStatus: "FAILED",
          notes: "No se pudo crear la preferencia de pago."
        }
      });

      return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar el checkout" }, { status: 400 });
  }
}