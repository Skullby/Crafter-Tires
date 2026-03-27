CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx"
ON "Product"
USING GIN ("name" gin_trgm_ops);
