const { userRepository } = require('../repositories');

/** Stories a VIP member may post per calendar month before needing extras. */
const MONTHLY_STORY_LIMIT = 10;

/**
 * The quota bucket the given moment falls into, as 'YYYY-MM'.
 *
 * Formatted in Africa/Cairo so the month rolls over at local midnight —
 * using UTC would reset a couple of hours early for everyone.
 */
function currentMonth(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: '2-digit',
    }).format(now);
}

class StoryQuotaService {
    get limit() {
        return MONTHLY_STORY_LIMIT;
    }

    /** True while the member's paid month is still running. */
    isVipActive(user, now = new Date()) {
        if (user?.vip_status !== 'vip') return false;
        if (!user.vip_expires_at) return true; // legacy VIPs, granted before expiry tracking
        return new Date(user.vip_expires_at) > now;
    }

    /**
     * Quota for a user, with month rollover applied in memory.
     *
     * Rollover is not written back here — it is persisted on the next
     * consume(), so a read never mutates.
     */
    getQuota(user, now = new Date()) {
        const month = currentMonth(now);
        const isNewMonth = user?.stories_month !== month;

        // A new month zeroes usage *and* clears leftover admin credits: extras
        // are granted for the month they were needed in, not banked forever.
        const used = isNewMonth ? 0 : user?.stories_used || 0;
        const bonus = isNewMonth ? 0 : user?.bonus_story_credits || 0;

        return {
            month,
            limit: MONTHLY_STORY_LIMIT,
            used,
            bonus,
            remaining: Math.max(0, MONTHLY_STORY_LIMIT - used) + bonus,
            vipActive: this.isVipActive(user, now),
            vipExpiresAt: user?.vip_expires_at || null,
        };
    }

    /**
     * Record one posted story.
     *
     * The monthly allowance is spent first; only once it is exhausted do
     * admin-granted credits get drawn down.
     */
    async consume(user, now = new Date()) {
        const quota = this.getQuota(user, now);
        const withinMonthly = quota.used < quota.limit;

        return userRepository.update(
            { id: user.id },
            {
                stories_month: quota.month,
                stories_used: withinMonthly ? quota.used + 1 : quota.used,
                bonus_story_credits: withinMonthly ? quota.bonus : Math.max(0, quota.bonus - 1),
            }
        );
    }

    /** Admin grant: extra stories for the current month only. */
    async grantCredits(userId, credits) {
        const amount = parseInt(credits, 10);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('عدد القصص الإضافية غير صالح');
        }

        const user = await userRepository.findOne({ id: userId });
        if (!user) throw new Error('المستخدم غير موجود');

        // getQuota already collapses a stale month to zero, so adding on top of
        // quota.bonus (not the raw column) avoids reviving last month's leftovers.
        const quota = this.getQuota(user);
        return userRepository.update(
            { id: userId },
            {
                stories_month: quota.month,
                stories_used: quota.used,
                bonus_story_credits: quota.bonus + amount,
            }
        );
    }
}

module.exports = new StoryQuotaService();
module.exports.currentMonth = currentMonth;
module.exports.MONTHLY_STORY_LIMIT = MONTHLY_STORY_LIMIT;
