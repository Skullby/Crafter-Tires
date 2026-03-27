import { PrismaClient, Prisma } from "@prisma/client";

const RESERVATION_TTL_MINUTES = 30;

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface ReservationItem {
  productId: string;
  quantity: number;
}

/**
 * Reserve stock for an order inside an existing Prisma interactive transaction.
 *
 * Uses conditional updateMany (stock >= qty) per item so concurrent checkouts
 * cannot oversell. Also opportunistically releases expired pending reservations
 * before attempting the new reservation.
 */
export async function reserveStock(
  tx: TxClient,
  orderId: string,
  items: ReservationItem[]
) {
  // Opportunistically release expired reservations to reclaim stock
  await releaseExpiredReservations(tx);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MINUTES * 60_000);

  for (const item of items) {
    const inventory = await tx.inventory.findUnique({
      where: { productId: item.productId },
    });

    if (!inventory) {
      throw new InsufficientStockError(item.productId);
    }

    const updated = await tx.inventory.updateMany({
      where: {
        id: inventory.id,
        stock: { gte: item.quantity },
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });

    if (updated.count !== 1) {
      throw new InsufficientStockError(item.productId);
    }

    await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        change: -item.quantity,
        reason: "STOCK_RESERVED",
        note: `Reserva orden ${orderId}`,
      },
    });
  }

  await tx.order.update({
    where: { id: orderId },
    data: {
      stockReservedAt: now,
      reservationExpiresAt: expiresAt,
    },
  });
}

/**
 * Release previously reserved stock back into inventory.
 * Called on payment failure/rejection/cancel or reservation expiry.
 * No-op if the order has no reservation or stock was already confirmed.
 */
export async function releaseStock(tx: TxClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || !order.stockReservedAt || order.stockAppliedAt) {
    return;
  }

  for (const item of order.items) {
    const inventory = await tx.inventory.findUnique({
      where: { productId: item.productId },
    });

    if (!inventory) {
      continue;
    }

    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        stock: { increment: item.quantity },
      },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        change: item.quantity,
        reason: "RESERVATION_RELEASED",
        note: `Liberacion orden ${order.number}`,
      },
    });
  }

  await tx.order.update({
    where: { id: orderId },
    data: {
      stockReservedAt: null,
      reservationExpiresAt: null,
    },
  });
}

/**
 * Confirm a reservation when payment is approved.
 * Stock was already decremented during reservation so no further decrement
 * is needed — just stamp stockAppliedAt for idempotency and audit.
 */
export async function confirmReservedStock(tx: TxClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return;
  }

  // Already confirmed — idempotent
  if (order.stockAppliedAt) {
    return;
  }

  if (!order.stockReservedAt) {
    // Edge case: reservation expired and was released before webhook arrived.
    // Fall back to decrementing stock now (same logic as old applyApprovedPayment).
    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (!inventory) {
        throw new Error(`Inventario faltante para producto ${item.productId}`);
      }

      const updated = await tx.inventory.updateMany({
        where: {
          id: inventory.id,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw new Error(
          `Stock insuficiente para aplicar la orden ${order.number}`
        );
      }

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          change: -item.quantity,
          reason: "ORDER_PAID",
          note: `Orden ${order.number}`,
        },
      });
    }
  } else {
    // Reservation exists — create confirmation audit entries (0 change)
    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (inventory) {
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            change: 0,
            reason: "RESERVATION_CONFIRMED",
            note: `Pago aprobado orden ${order.number}`,
          },
        });
      }
    }
  }

  await tx.order.update({
    where: { id: orderId },
    data: {
      stockAppliedAt: new Date(),
      reservationExpiresAt: null,
    },
  });
}

/**
 * Release stock for all expired pending reservations.
 * Called opportunistically before new reservations.
 */
export async function releaseExpiredReservations(tx: TxClient) {
  const expired = await tx.order.findMany({
    where: {
      stockReservedAt: { not: null },
      stockAppliedAt: null,
      reservationExpiresAt: { lt: new Date() },
      status: "PENDING",
    },
    include: { items: true },
  });

  for (const order of expired) {
    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (!inventory) {
        continue;
      }

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          stock: { increment: item.quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          change: item.quantity,
          reason: "RESERVATION_EXPIRED",
          note: `Expiro reserva orden ${order.number}`,
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        stockReservedAt: null,
        reservationExpiresAt: null,
        status: "CANCELED",
        notes: "Reserva de stock expirada",
      },
    });
  }

  return expired.length;
}

export class InsufficientStockError extends Error {
  public readonly productId: string;

  constructor(productId: string) {
    super(`Stock insuficiente para producto ${productId}`);
    this.name = "InsufficientStockError";
    this.productId = productId;
  }
}
