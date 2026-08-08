-- ─────────────────────────────────────────────────────────────────────────────
-- 003 — username
--
-- Collected at registration alongside the phone number. Login still happens by
-- phone; this is an additional identifier, not a credential.
--
-- Nullable on purpose: accounts created before this column existed keep working
-- and are never forced to pick one retroactively.
--
-- Run once (SQL Editor, or psql via DIRECT_URL). Idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.users
    add column if not exists username text;

-- Case-insensitive uniqueness: "Ahmed" and "ahmed" are the same handle.
-- A partial index skips NULLs, so any number of legacy rows without a username
-- can coexist.
create unique index if not exists users_username_lower_key
    on public.users (lower(username))
    where username is not null;
