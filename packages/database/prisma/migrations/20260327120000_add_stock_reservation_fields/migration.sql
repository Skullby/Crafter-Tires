-- AlterTable
ALTER TABLE "Order" ADD COLUMN "stockReservedAt" TIMESTAMP(3),
ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);
