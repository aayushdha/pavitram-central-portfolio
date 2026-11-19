-- One-time fix for: QueryFailedError: invalid input value for enum jobportal_users_role_enum: "BUYER"
--
-- The shared Postgres still has an OLD jobportal_users table from the real-estate version of this project
-- (roles like BUYER/SELLER/AGENT). The job portal only knows SEEKER / EMPLOYER / ADMIN, so TypeORM's
-- auto-sync cannot convert the old rows and the backend crashes on start.
--
-- This keeps every row, turns old roles into SEEKER (nobody inherits ADMIN from legacy data -
-- make real admins again on purpose later), and lets the backend recreate the enum itself.
-- Only touches the jobportal_users table. Safe to run twice.

BEGIN;
ALTER TABLE jobportal_users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE jobportal_users ALTER COLUMN role TYPE text USING role::text;
UPDATE jobportal_users SET role = 'SEEKER' WHERE role NOT IN ('SEEKER', 'EMPLOYER');
DROP TYPE IF EXISTS jobportal_users_role_enum;
DROP TYPE IF EXISTS jobportal_users_role_enum_old;
COMMIT;

-- Check afterwards:
SELECT role, count(*) FROM jobportal_users GROUP BY role;
