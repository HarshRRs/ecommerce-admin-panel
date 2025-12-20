-- Migration: Add soft delete support and database constraints
-- Date: 2025-12-20
-- Description: Adds deletedAt fields for soft deletes and additional constraints for data integrity

-- Add deletedAt columns to tables that support soft delete
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

-- Add indexes for soft delete queries
CREATE INDEX IF NOT EXISTS "idx_users_deletedAt" ON "users"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_stores_deletedAt" ON "stores"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_products_deletedAt" ON "products"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_customers_deletedAt" ON "customers"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_orders_deletedAt" ON "orders"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_coupons_deletedAt" ON "coupons"("deletedAt") WHERE "deletedAt" IS NULL;

-- Add check constraints for data integrity
ALTER TABLE "products" ADD CONSTRAINT "chk_products_price_positive" 
  CHECK ("basePrice" >= 0);

ALTER TABLE "products" ADD CONSTRAINT "chk_products_stock_non_negative" 
  CHECK ("stock" >= 0);

ALTER TABLE "product_variants" ADD CONSTRAINT "chk_variants_stock_non_negative" 
  CHECK ("stock" >= 0);

ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_totals_non_negative" 
  CHECK ("subtotal" >= 0 AND "tax" >= 0 AND "shipping" >= 0 AND "discount" >= 0 AND "total" >= 0);

ALTER TABLE "coupons" ADD CONSTRAINT "chk_coupons_value_positive" 
  CHECK ("value" > 0);

ALTER TABLE "coupons" ADD CONSTRAINT "chk_coupons_usage_non_negative" 
  CHECK ("usageCount" >= 0);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_products_store_status_featured" 
  ON "products"("storeId", "status", "isFeatured") 
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_orders_store_customer_status" 
  ON "orders"("storeId", "customerId", "status", "createdAt" DESC) 
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_customers_store_email" 
  ON "customers"("storeId", "email") 
  WHERE "deletedAt" IS NULL;

-- Add partial indexes for active records
CREATE INDEX IF NOT EXISTS "idx_coupons_active" 
  ON "coupons"("storeId", "code") 
  WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL;

-- Comments for documentation
COMMENT ON COLUMN "users"."deletedAt" IS 'Soft delete timestamp. NULL means record is active.';
COMMENT ON COLUMN "stores"."deletedAt" IS 'Soft delete timestamp. NULL means record is active.';
COMMENT ON COLUMN "products"."deletedAt" IS 'Soft delete timestamp. NULL means record is active.';
COMMENT ON COLUMN "customers"."deletedAt" IS 'Soft delete timestamp. NULL means record is active.';
COMMENT ON COLUMN "orders"."deletedAt" IS 'Soft delete timestamp. NULL means record is active.';
COMMENT ON COLUMN "coupons"."deletedAt" IS 'Soft delete timestamp. NULL means record is active.';
