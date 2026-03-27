import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  reserveStock,
  releaseStock,
  confirmReservedStock,
  releaseExpiredReservations,
  InsufficientStockError,
} from "./inventory";

// ---------------------------------------------------------------------------
// Helpers to build a fake Prisma transaction client
// ---------------------------------------------------------------------------

function createMockInventory(overrides: Record<string, unknown> = {}) {
  return { id: "inv-1", productId: "prod-1", stock: 10, ...overrides };
}

function createMockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    number: "CT-20260327-120000-123456",
    stockReservedAt: null,
    stockAppliedAt: null,
    reservationExpiresAt: null,
    items: [{ productId: "prod-1", quantity: 2 }],
    ...overrides,
  };
}

function createMockTx() {
  return {
    inventory: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    inventoryMovement: {
      create: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };
}

type MockTx = ReturnType<typeof createMockTx>;

// ---------------------------------------------------------------------------
// reserveStock
// ---------------------------------------------------------------------------

describe("reserveStock", () => {
  let tx: MockTx;

  beforeEach(() => {
    tx = createMockTx();
    // releaseExpiredReservations is called first — return no expired orders
    tx.order.findMany.mockResolvedValue([]);
  });

  it("decrements stock and stamps reservation fields on order", async () => {
    const inv = createMockInventory({ stock: 10 });
    tx.inventory.findUnique.mockResolvedValue(inv);
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });
    tx.inventoryMovement.create.mockResolvedValue({});
    tx.order.update.mockResolvedValue({});

    await reserveStock(tx as any, "order-1", [
      { productId: "prod-1", quantity: 3 },
    ]);

    // Conditional decrement was called with gte guard
    expect(tx.inventory.updateMany).toHaveBeenCalledWith({
      where: { id: "inv-1", stock: { gte: 3 } },
      data: { stock: { decrement: 3 } },
    });

    // Audit movement recorded
    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        inventoryId: "inv-1",
        change: -3,
        reason: "STOCK_RESERVED",
      }),
    });

    // Order stamped with reservation timestamps
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: expect.objectContaining({
        stockReservedAt: expect.any(Date),
        reservationExpiresAt: expect.any(Date),
      }),
    });

    // Verify expiry is ~30 minutes from now
    const updateCall = tx.order.update.mock.calls[0][0] as {
      data: { reservationExpiresAt: Date; stockReservedAt: Date };
    };
    const diffMs =
      updateCall.data.reservationExpiresAt.getTime() -
      updateCall.data.stockReservedAt.getTime();
    expect(diffMs).toBe(30 * 60_000);
  });

  it("throws InsufficientStockError when inventory row missing", async () => {
    tx.inventory.findUnique.mockResolvedValue(null);

    await expect(
      reserveStock(tx as any, "order-1", [
        { productId: "prod-1", quantity: 1 },
      ])
    ).rejects.toThrow(InsufficientStockError);
  });

  it("throws InsufficientStockError when conditional update matches 0 rows", async () => {
    tx.inventory.findUnique.mockResolvedValue(
      createMockInventory({ stock: 2 })
    );
    tx.inventory.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      reserveStock(tx as any, "order-1", [
        { productId: "prod-1", quantity: 5 },
      ])
    ).rejects.toThrow(InsufficientStockError);
  });

  it("handles multiple items atomically", async () => {
    const inv1 = createMockInventory({ id: "inv-1", productId: "prod-1" });
    const inv2 = createMockInventory({ id: "inv-2", productId: "prod-2" });

    tx.inventory.findUnique
      .mockResolvedValueOnce(inv1)
      .mockResolvedValueOnce(inv2);
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });
    tx.inventoryMovement.create.mockResolvedValue({});
    tx.order.update.mockResolvedValue({});

    await reserveStock(tx as any, "order-1", [
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 3 },
    ]);

    expect(tx.inventory.updateMany).toHaveBeenCalledTimes(2);
    expect(tx.inventoryMovement.create).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// releaseStock
// ---------------------------------------------------------------------------

describe("releaseStock", () => {
  let tx: MockTx;

  beforeEach(() => {
    tx = createMockTx();
  });

  it("increments stock back and clears reservation fields", async () => {
    tx.order.findUnique.mockResolvedValue(
      createMockOrder({ stockReservedAt: new Date() })
    );
    tx.inventory.findUnique.mockResolvedValue(createMockInventory());
    tx.inventory.update.mockResolvedValue({});
    tx.inventoryMovement.create.mockResolvedValue({});
    tx.order.update.mockResolvedValue({});

    await releaseStock(tx as any, "order-1");

    expect(tx.inventory.update).toHaveBeenCalledWith({
      where: { id: "inv-1" },
      data: { stock: { increment: 2 } },
    });

    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        change: 2,
        reason: "RESERVATION_RELEASED",
      }),
    });

    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { stockReservedAt: null, reservationExpiresAt: null },
    });
  });

  it("no-ops when order has no reservation", async () => {
    tx.order.findUnique.mockResolvedValue(createMockOrder());

    await releaseStock(tx as any, "order-1");

    expect(tx.inventory.update).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it("no-ops when stock was already confirmed (stockAppliedAt set)", async () => {
    tx.order.findUnique.mockResolvedValue(
      createMockOrder({
        stockReservedAt: new Date(),
        stockAppliedAt: new Date(),
      })
    );

    await releaseStock(tx as any, "order-1");

    expect(tx.inventory.update).not.toHaveBeenCalled();
  });

  it("no-ops when order not found", async () => {
    tx.order.findUnique.mockResolvedValue(null);

    await releaseStock(tx as any, "order-1");

    expect(tx.inventory.update).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// confirmReservedStock
// ---------------------------------------------------------------------------

describe("confirmReservedStock", () => {
  let tx: MockTx;

  beforeEach(() => {
    tx = createMockTx();
  });

  it("stamps stockAppliedAt without decrementing when reservation exists", async () => {
    tx.order.findUnique.mockResolvedValue(
      createMockOrder({ stockReservedAt: new Date() })
    );
    tx.inventory.findUnique.mockResolvedValue(createMockInventory());
    tx.inventoryMovement.create.mockResolvedValue({});
    tx.order.update.mockResolvedValue({});

    await confirmReservedStock(tx as any, "order-1");

    // No decrement — stock was already reserved
    expect(tx.inventory.updateMany).not.toHaveBeenCalled();

    // Audit trail with 0 change
    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        change: 0,
        reason: "RESERVATION_CONFIRMED",
      }),
    });

    // stockAppliedAt stamped
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: expect.objectContaining({
        stockAppliedAt: expect.any(Date),
        reservationExpiresAt: null,
      }),
    });
  });

  it("is idempotent — no-ops when stockAppliedAt already set", async () => {
    tx.order.findUnique.mockResolvedValue(
      createMockOrder({
        stockReservedAt: new Date(),
        stockAppliedAt: new Date(),
      })
    );

    await confirmReservedStock(tx as any, "order-1");

    expect(tx.inventory.updateMany).not.toHaveBeenCalled();
    expect(tx.inventoryMovement.create).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it("falls back to direct decrement when reservation expired (no stockReservedAt)", async () => {
    const inv = createMockInventory();
    tx.order.findUnique.mockResolvedValue(createMockOrder());
    tx.inventory.findUnique.mockResolvedValue(inv);
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });
    tx.inventoryMovement.create.mockResolvedValue({});
    tx.order.update.mockResolvedValue({});

    await confirmReservedStock(tx as any, "order-1");

    // Fallback decrement with gte guard
    expect(tx.inventory.updateMany).toHaveBeenCalledWith({
      where: { id: "inv-1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });

    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        change: -2,
        reason: "ORDER_PAID",
      }),
    });
  });

  it("throws when fallback decrement fails due to insufficient stock", async () => {
    tx.order.findUnique.mockResolvedValue(createMockOrder());
    tx.inventory.findUnique.mockResolvedValue(createMockInventory({ stock: 0 }));
    tx.inventory.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      confirmReservedStock(tx as any, "order-1")
    ).rejects.toThrow("Stock insuficiente");
  });
});

// ---------------------------------------------------------------------------
// releaseExpiredReservations
// ---------------------------------------------------------------------------

describe("releaseExpiredReservations", () => {
  let tx: MockTx;

  beforeEach(() => {
    tx = createMockTx();
  });

  it("returns 0 when no expired reservations exist", async () => {
    tx.order.findMany.mockResolvedValue([]);

    const count = await releaseExpiredReservations(tx as any);

    expect(count).toBe(0);
  });

  it("releases stock and cancels expired orders", async () => {
    const expiredOrder = createMockOrder({
      stockReservedAt: new Date(Date.now() - 60 * 60_000),
      reservationExpiresAt: new Date(Date.now() - 30 * 60_000),
      status: "PENDING",
    });
    tx.order.findMany.mockResolvedValue([expiredOrder]);
    tx.inventory.findUnique.mockResolvedValue(createMockInventory());
    tx.inventory.update.mockResolvedValue({});
    tx.inventoryMovement.create.mockResolvedValue({});
    tx.order.update.mockResolvedValue({});

    const count = await releaseExpiredReservations(tx as any);

    expect(count).toBe(1);

    expect(tx.inventory.update).toHaveBeenCalledWith({
      where: { id: "inv-1" },
      data: { stock: { increment: 2 } },
    });

    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        change: 2,
        reason: "RESERVATION_EXPIRED",
      }),
    });

    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: expect.objectContaining({
        stockReservedAt: null,
        reservationExpiresAt: null,
        status: "CANCELED",
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// InsufficientStockError
// ---------------------------------------------------------------------------

describe("InsufficientStockError", () => {
  it("carries productId and correct name", () => {
    const err = new InsufficientStockError("prod-42");
    expect(err.productId).toBe("prod-42");
    expect(err.name).toBe("InsufficientStockError");
    expect(err.message).toContain("prod-42");
    expect(err).toBeInstanceOf(Error);
  });
});
