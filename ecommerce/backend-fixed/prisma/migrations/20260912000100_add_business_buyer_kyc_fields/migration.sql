-- Business PAN, CIN/Udyam, trade license, bank account were collected on
-- the B2B registration form but had no column to be saved into.
ALTER TABLE "ecom_business_buyers" ADD COLUMN "pan" TEXT;
ALTER TABLE "ecom_business_buyers" ADD COLUMN "cin" TEXT;
ALTER TABLE "ecom_business_buyers" ADD COLUMN "tradeLicense" TEXT;
ALTER TABLE "ecom_business_buyers" ADD COLUMN "bankAccount" TEXT;

-- Vendor registration form collects GSTIN/PAN/bank account too — same gap.
ALTER TABLE "ecom_vendors" ADD COLUMN "gstin" TEXT;
ALTER TABLE "ecom_vendors" ADD COLUMN "pan" TEXT;
ALTER TABLE "ecom_vendors" ADD COLUMN "bankAccount" TEXT;

-- Sample orders had no vendor/buyer id link at all — every vendor saw
-- every other vendor's sample-order requests mixed together.
ALTER TABLE "ecom_sample_orders" ADD COLUMN "buyerId" TEXT;
ALTER TABLE "ecom_sample_orders" ADD COLUMN "vendorId" TEXT;

-- Store Setup's About/logo/cover had no columns to save into.
ALTER TABLE "ecom_store_profiles" ADD COLUMN "about" TEXT;
ALTER TABLE "ecom_store_profiles" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "ecom_store_profiles" ADD COLUMN "coverUrl" TEXT;
