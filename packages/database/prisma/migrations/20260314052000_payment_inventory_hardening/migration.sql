-- Harden payment/inventory flow so approved payments decrement stock exactly once.
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "stockAppliedAt" TIMESTAMP(3);

-- Helpful ops index for admin order views / payment status filtering.
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_status_createdAt_idx"
ON "Order"("paymentStatus", "status", "createdAt");

-- Guard inventory from going negative at the database layer.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inventory_stock_nonnegative'
  ) THEN
    ALTER TABLE "Inventory"
    ADD CONSTRAINT inventory_stock_nonnegative CHECK (stock >= 0);
  END IF;
END $$;
