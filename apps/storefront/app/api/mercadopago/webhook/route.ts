import { NextResponse } from "next/server";
import { prisma } from "@crafter/database";
import {
  applyApprovedPayment,
  applyFailedPayment,
  fetchPaymentDetails,
  mapMercadoPagoStatus,
} from "../../../../lib/mercadopago";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const paymentId = payload?.data?.id || payload?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const details = await fetchPaymentDetails(String(paymentId));
    const status = mapMercadoPagoStatus(details.status);
    const orderId = details.external_reference as string | undefined;
    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        provider: "MERCADOPAGO",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      return NextResponse.json({ ok: true });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: String(paymentId),
        status,
        rawPayload: details,
      },
    });

    if (status === "APPROVED") {
      await applyApprovedPayment(orderId);
    } else if (status === "PENDING") {
      // Still waiting — no stock changes needed, reservation holds
    } else {
      // REJECTED or FAILED — release reserved stock
      await applyFailedPayment(orderId, status);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
