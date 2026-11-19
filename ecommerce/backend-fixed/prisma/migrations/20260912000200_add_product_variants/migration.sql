-- The vendor "Add Product" variant builder (size/color options, each with
-- their own price/stock/SKU) had nowhere to save this data — it was
-- silently stripped by the global ValidationPipe's whitelist:true.
CREATE TABLE "ecom_product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ecom_product_variants_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ecom_product_variants" ADD CONSTRAINT "ecom_product_variants_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "ecom_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Order.commission — computed via the real commission-rules engine at
-- order-creation time, instead of the vendor Earnings page's hardcoded 10%.
ALTER TABLE "ecom_orders" ADD COLUMN "commission" DOUBLE PRECISION;

-- Coupon code applied at checkout — the whole coupon feature was previously
-- unreachable from checkout, so this also had nowhere to be recorded.
ALTER TABLE "ecom_orders" ADD COLUMN "couponCode" TEXT;
