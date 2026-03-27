import {
  prisma,
  PaymentStatus,
  confirmReservedStock,
  releaseStock,
} from "@crafter/database";

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

/**
 * Handle approved payment: confirm the stock reservation (or fall back to
 * direct decrement if the reservation expired before the webhook arrived).
 */
export async function applyApprovedPayment(orderId: string) {
  await prisma.$transaction(async (tx) => {
    await confirmReservedStock(tx, orderId);

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentStatus: PaymentStatus.APPROVED,
      },
    });
  });
}

/**
 * Handle terminal non-approved payment states: release reserved stock
 * back into inventory and update order status.
 */
export async function applyFailedPayment(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  await prisma.$transaction(async (tx) => {
    await releaseStock(tx, orderId);

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        status: mapOrderStatusFromPaymentStatus(paymentStatus),
      },
    });
  });
}
