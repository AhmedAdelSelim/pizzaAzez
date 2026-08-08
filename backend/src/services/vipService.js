const { userRepository } = require('../repositories');

class VipService {
    async requestVip(userId) {
        console.log('vipService: Requesting VIP for userId:', userId);
        try {
            const result = await userRepository.update({ id: userId }, { vip_status: 'pending' });
            console.log('vipService: Update result success');
            return result;
        } catch (error) {
            console.error('vipService requestVip error:', error);
            throw error;
        }
    }

    async getPendingRequests() {
        console.log('vipService: Getting pending requests');
        return await userRepository.find({ vip_status: 'pending' });
    }

    async handleVipRequest(userId, status) {
        // status should be 'vip' or 'none' (declined)
        const finalStatus = status === 'vip' ? 'vip' : 'none';
        console.log('vipService: Handling VIP request for:', userId, 'Status:', finalStatus);

        const updates = { vip_status: finalStatus };

        if (finalStatus === 'vip') {
            // Approving starts a one-month subscription. An existing unexpired
            // membership is extended rather than truncated, so approving twice
            // never costs the member time.
            const current = await userRepository.findOne({ id: userId });
            const now = new Date();
            const existing = current?.vip_expires_at ? new Date(current.vip_expires_at) : null;
            const from = existing && existing > now ? existing : now;

            const expires = new Date(from);
            expires.setMonth(expires.getMonth() + 1);
            updates.vip_expires_at = expires.toISOString();
        } else {
            updates.vip_expires_at = null;
        }

        return await userRepository.update({ id: userId }, updates);
    }

    /** Extend an active membership by whole months (admin renewal). */
    async extendSubscription(userId, months = 1) {
        const count = parseInt(months, 10);
        if (!Number.isFinite(count) || count <= 0) {
            throw new Error('عدد الأشهر غير صالح');
        }

        const user = await userRepository.findOne({ id: userId });
        if (!user) throw new Error('المستخدم غير موجود');

        const now = new Date();
        const existing = user.vip_expires_at ? new Date(user.vip_expires_at) : null;
        const from = existing && existing > now ? existing : now;

        const expires = new Date(from);
        expires.setMonth(expires.getMonth() + count);

        return await userRepository.update(
            { id: userId },
            { vip_status: 'vip', vip_expires_at: expires.toISOString() }
        );
    }
}

module.exports = new VipService();
