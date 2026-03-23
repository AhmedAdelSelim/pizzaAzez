const { userRepository } = require('../repositories');
const { getDb } = require('../config/db');

class LoyaltyService {
    // 1 point per EGP, 100 points = 10 EGP discount
    POINTS_PER_EGP = 1;
    POINTS_PER_DISCOUNT = 100;
    DISCOUNT_PER_BLOCK = 10;

    async getPoints(userId) {
        const user = await userRepository.findOne({ id: userId });
        const points = user?.loyalty_points || 0;
        return {
            points,
            discount_available: Math.floor(points / this.POINTS_PER_DISCOUNT) * this.DISCOUNT_PER_BLOCK,
        };
    }

    async awardPoints(userId, orderTotal) {
        const user = await userRepository.findOne({ id: userId });
        const current = user?.loyalty_points || 0;
        const earned = Math.floor(orderTotal * this.POINTS_PER_EGP);
        await userRepository.update({ id: userId }, { loyalty_points: current + earned });
        return earned;
    }

    async redeemPoints(userId, pointsToRedeem) {
        if (pointsToRedeem < this.POINTS_PER_DISCOUNT)
            throw new Error(`الحد الأدنى للاسترداد ${this.POINTS_PER_DISCOUNT} نقطة`);
        if (pointsToRedeem % this.POINTS_PER_DISCOUNT !== 0)
            throw new Error(`يجب استرداد نقاط بمضاعفات ${this.POINTS_PER_DISCOUNT}`);

        const user = await userRepository.findOne({ id: userId });
        const current = user?.loyalty_points || 0;
        if (current < pointsToRedeem) throw new Error('رصيد النقاط غير كافٍ');

        const discount = (pointsToRedeem / this.POINTS_PER_DISCOUNT) * this.DISCOUNT_PER_BLOCK;
        await userRepository.update({ id: userId }, { loyalty_points: current - pointsToRedeem });
        return { discount, points_used: pointsToRedeem };
    }

    async applyReferral(referralCode, newUserId) {
        const suffix = referralCode.toUpperCase().replace('AZEZ', '');
        const { data } = await getDb().from('users').select('*').ilike('phone', `%${suffix}`);
        if (!data || data.length === 0) throw new Error('كود الإحالة غير صحيح');

        const referrer = data[0];
        if (referrer.id === newUserId) throw new Error('لا يمكنك استخدام كودك الخاص');

        const REFERRAL_POINTS = 50;
        await this.awardPoints(referrer.id, REFERRAL_POINTS);
        await this.awardPoints(newUserId, REFERRAL_POINTS);
        return { success: true, points_awarded: REFERRAL_POINTS };
    }
}

module.exports = new LoyaltyService();
