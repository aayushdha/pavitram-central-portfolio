-- LAST RESORT (destructive): deletes ONLY this project's tables/enums (names starting with "jobportal_")
-- in the shared database, so the backend can recreate them fresh on start.
-- Other projects' tables (realnew_*, ecommerce, ...) are NOT touched. All job portal data is lost.
-- Use only if it is test data. Prefer scripts/fix-legacy-roles.sql, which keeps your rows.

BEGIN;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables
           WHERE schemaname = 'public' AND tablename LIKE 'jobportal\_%' LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
  FOR r IN SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
           WHERE n.nspname = 'public' AND t.typtype = 'e' AND t.typname LIKE 'jobportal\_%' LOOP
    EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.typname);
  END LOOP;
END $$;
COMMIT;

SELECT count(*) AS jobportal_tables_left FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'jobportal\_%';
