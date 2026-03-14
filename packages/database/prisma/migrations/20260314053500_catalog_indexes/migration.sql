-- Catalog performance indexes for common storefront filters/sorts.
CREATE INDEX IF NOT EXISTS "Product_active_categoryId_brandId_idx"
ON "Product"("active", "categoryId", "brandId");

CREATE INDEX IF NOT EXISTS "Product_active_width_height_rim_vehicleType_idx"
ON "Product"("active", "width", "height", "rim", "vehicleType");

CREATE INDEX IF NOT EXISTS "Product_active_price_idx"
ON "Product"("active", "price");
