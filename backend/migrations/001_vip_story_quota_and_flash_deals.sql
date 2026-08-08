-- ─────────────────────────────────────────────────────────────────────────────
-- 001 — VIP monthly subscription + story quota, and the missing flash_deals table
--
-- Run once against the Supabase project (SQL Editor, or psql via DIRECT_URL).
-- Every statement is idempotent, so re-running is safe.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── flash_deals ──────────────────────────────────────────────────────────────
-- Lost in the restore; GET /api/flash-deals 400s without it.
-- Shape is taken from src/services/flashDealService.js.
create table if not exists public.flash_deals (
    id               text primary key,
    title            text not null,
    discount_percent numeric,
    is_active        boolean     not null default true,
    expires_at       timestamptz,
    created_at       timestamptz not null default now()
);

create index if not exists flash_deals_active_expires_idx
    on public.flash_deals (is_active, expires_at desc);

-- ── VIP subscription + story quota ───────────────────────────────────────────
-- vip_expires_at      : end of the paid month; NULL means "no expiry set".
-- stories_month       : 'YYYY-MM' bucket the counters below belong to.
-- stories_used        : stories posted inside stories_month.
-- bonus_story_credits : one-off extras granted by an admin; cleared on rollover.
--
-- The monthly counter lives on users (not derived from the stories table)
-- because cleanupService deletes stories after 24 h, so history is not available
-- to count against.
alter table public.users
    add column if not exists vip_expires_at      timestamptz,
    add column if not exists stories_month       text,
    add column if not exists stories_used        integer not null default 0,
    add column if not exists bonus_story_credits integer not null default 0;

-- Attribute a story to its author so the UI can show "your" stories and so an
-- admin can trace who posted what.
alter table public.stories
    add column if not exists user_id text;

create index if not exists stories_user_id_idx on public.stories (user_id);
