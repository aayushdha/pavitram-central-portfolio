-- Adds stable identity columns to ecom_orders so "my orders"/"my store's
-- orders" can be matched by id instead of a mutable display-name snapshot.
-- Nullable + no backfill: existing rows keep working via the app's
-- name-match fallback for legacy orders placed before this migration.
ALTER TABLE "ecom_orders" ADD COLUMN "userId" TEXT;
ALTER TABLE "ecom_orders" ADD COLUMN "vendorId" TEXT;
