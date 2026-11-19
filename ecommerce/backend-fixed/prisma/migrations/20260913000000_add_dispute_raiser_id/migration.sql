-- Lets a customer/vendor see disputes they personally raised, instead of
-- only admins being able to see the full unscoped list.
ALTER TABLE "ecom_disputes" ADD COLUMN "raisedByUserId" TEXT;
