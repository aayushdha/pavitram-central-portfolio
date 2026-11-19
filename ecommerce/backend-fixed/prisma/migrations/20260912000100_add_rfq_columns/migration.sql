-- Adds routing (buyerId/vendorId) and quote data columns that the frontend
-- was already sending but which had no matching schema column — the API's
-- whitelist ValidationPipe was silently discarding all of them.
ALTER TABLE "ecom_rfqs" ADD COLUMN "buyerId" TEXT;
ALTER TABLE "ecom_rfqs" ADD COLUMN "vendorId" TEXT;
ALTER TABLE "ecom_rfqs" ADD COLUMN "quotedPrice" DOUBLE PRECISION;
ALTER TABLE "ecom_rfqs" ADD COLUMN "leadTime" TEXT;
ALTER TABLE "ecom_rfqs" ADD COLUMN "validUntil" TEXT;
ALTER TABLE "ecom_rfqs" ADD COLUMN "notes" TEXT;
ALTER TABLE "ecom_rfqs" ADD COLUMN "targetDate" TEXT;
