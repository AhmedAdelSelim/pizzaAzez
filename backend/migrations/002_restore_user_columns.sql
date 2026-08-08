-- ─────────────────────────────────────────────────────────────────────────────
-- 002 — user columns lost in the restore
--
-- The application writes and reads all four, so their absence surfaces as
-- "Could not find the '<name>' column of 'users' in the schema cache".
--
-- Run once against the Supabase project (SQL Editor, or psql via DIRECT_URL).
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.users
    -- Written by register + profile edit; read by the birthday-discount check
    -- in loyaltyService.checkBirthdayDiscount.
    add column if not exists birthday       date,

    -- loyaltyService: earn / redeem points, and the tier shown on /profile.
    add column if not exists loyalty_points integer not null default 0,

    -- loyaltyService: referral credit, 50 points per referred friend.
    add column if not exists referral_count integer not null default 0,

    -- Expo push token. Read when notifying a customer of an order-status change
    -- (adminService) and when broadcasting a flash deal (flashDealService).
    add column if not exists push_token     text;
