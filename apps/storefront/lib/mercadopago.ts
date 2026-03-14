import { prisma, PaymentStatus } from "@crafter/database";

const MP_API_BASE = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");
  }
  return token;
}

export async function createMercadoPagoPreference(params: {
  orderId: string;
  orderNumber: string;
  amount: number;
  title: string;
  payerEmail: string;
}) {
  const storeUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000";
  const token = getAccessToken();

  const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_reference: params.orderId,
      statement_descriptor: "CRAFTERTIRES",
      items: [
        {
          title: params.title,
          quantity: 1,
          unit_price: Number(params.amount),
          currency_id: "ARS"
        }
      ],
      payer: {
        email: params.payerEmail
      },
      notification_url: `${storeUrl}/api/mercadopago/webhook`,
      back_urls: {
        success: `${storeUrl}/checkout/resultado?estado=success&orden=${params.orderId}`,
        pending: `${storeUrl}/checkout/resultado?estado=pending&orden=${params.orderId}`,
        failure: `${storeUrl}/checkout/resultado?estado=failed&orden=${params.orderId}`
      },
      auto_return: "approved"
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Error Mercado Pago: ${payload}`);
  }

  return response.json();
}

export async function fetchPaymentDetails(paymentId: string) {
  const token = getAccessToken();

  const response = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el pago en Mercado Pago");
  }

  return response.json();
}

export function mapMercadoPagoStatus(status: string): PaymentStatus {
  if (status === "approved") {
    return PaymentStatus.APPROVED;
  }

  if (status === "pending" || status === "in_process") {
    return PaymentStatus.PENDING;
  }

  if (status === "rejected") {
    return PaymentStatus.REJECTED;
  }

  return PaymentStatus.FAILED;
}

export function mapOrderStatusFromPaymentStatus(status: PaymentStatus) {
  if (status === PaymentStatus.APPROVED) {
    return "PAID" as const;
  }

  if (status === PaymentStatus.PENDING) {
    return "PENDING" as const;
  }

  return "CANCELED" as const;
}

export async function applyApprovedPayment(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return;
    }

    if (order.stockAppliedAt) {
      if (order.paymentStatus !== PaymentStatus.APPROVED || order.status !== "PAID") {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.APPROVED,
            status: "PAID"
          }
        });
      }
      return;
    }

    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({ where: { productId: item.productId } });
      if (!inventory) {
        throw new Error(`Inventario faltante para producto ${item.productId}`);
      }

      const updated = await tx.inventory.updateMany({
        where: {
          id: inventory.id,
          stock: { gte: item.quantity }
        },
        data: {
          stock: { decrement: item.quantity }
        }
      });

      if (updated.count !== 1) {
        throw new Error(`Stock insuficiente para aplicar la orden ${order.number}`);
      }

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          change: -item.quantity,
          reason: "ORDER_PAID",
          note: `Orden ${order.number}`
        }
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: PaymentStatus.APPROVED,
        stockAppliedAt: new Date()
      }
    });
  });
}
