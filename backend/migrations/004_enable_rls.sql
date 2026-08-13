-- ─────────────────────────────────────────────────────────────────────────────
-- 004 — enable Row Level Security
--
-- WHY
--
-- The publishable Supabase key is public by design: it ships inside the web
-- bundle and is readable by anyone. Everything it is allowed to do is decided by
-- Row Level Security — and RLS was never switched on. With nothing but that key
-- it was possible to:
--
--   * read every row of `users`, including the password hashes
--   * read every order, with the customer's phone number and home address
--   * DELETE from `users`
--
-- ⚠️  READ THIS BEFORE RUNNING
--
-- The API must already be using the **secret (service_role)** key. That key
-- bypasses RLS; the publishable key does not. If you run this while the backend
-- is still on the publishable key, every API request starts failing
-- immediately.
--
--   1. Supabase dashboard → Project Settings → API → copy the service_role /
--      secret key.
--   2. Put it in the server's backend/.env as SUPABASE_KEY, and restart.
--      (src/config/index.js refuses to boot in production on a publishable key,
--      so this is enforced rather than remembered.)
--   3. Then run this file.
--
-- Safe to run more than once.
--
-- WHAT THIS DOES NOT TOUCH
--
-- Storage. Both apps upload profile and story images straight to the
-- `profile-images` bucket with the publishable key, and that is governed by
-- storage.objects policies, not by these tables. Nothing here changes it.
--
-- No table is queried directly by either client — all table access goes through
-- the API — so enabling RLS with no policies breaks nothing legitimate.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enabling RLS without adding a policy denies every role except service_role,
-- which bypasses RLS by definition. That default-deny is exactly what we want:
-- the API is the only thing that should ever reach these tables.
alter table public.users           enable row level security;
alter table public.orders          enable row level security;
alter table public.menu_items      enable row level security;
alter table public.categories      enable row level security;
alter table public.stories         enable row level security;
alter table public.coupons         enable row level security;
alter table public.delivery_zones  enable row level security;
alter table public.reviews         enable row level security;
alter table public.suggestions     enable row level security;

-- Added by migration 001; guarded in case that migration has not run here.
do $$
begin
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'flash_deals') then
        execute 'alter table public.flash_deals enable row level security';
    end if;
end $$;

-- Belt and braces: force RLS even for the table owner, so a future connection
-- made as the owning role cannot quietly read around it. service_role is still
-- unaffected.
alter table public.users  force row level security;
alter table public.orders force row level security;

-- ─── Verify ──────────────────────────────────────────────────────────────────
--
-- Every row should show rls_enabled = true and policy_count = 0.
--
--   select c.relname               as table_name,
--          c.relrowsecurity        as rls_enabled,
--          count(p.policyname)     as policy_count
--     from pg_class c
--     join pg_namespace n on n.oid = c.relnamespace
--     left join pg_policies p on p.tablename = c.relname and p.schemaname = 'public'
--    where n.nspname = 'public' and c.relkind = 'r'
--    group by c.relname, c.relrowsecurity
--    order by c.relname;
--
-- Then confirm from outside, with the publishable key — this must now return
-- an empty array rather than data:
--
--   curl "https://<project>.supabase.co/rest/v1/users?select=id&limit=1" \
--     -H "apikey: <publishable key>"
--
-- ─── After running ───────────────────────────────────────────────────────────
--
-- The Playwright suite deletes its own rows straight through the REST API, so it
-- needs the secret key too. Set TEST_SUPABASE_KEY to the service_role key in
-- web/.env.local (gitignored); on the publishable key teardown will now fail.
