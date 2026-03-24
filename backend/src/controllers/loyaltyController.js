const loyaltyService = require('../services/loyaltyService');

const loyaltyController = {
    async getPoints(request, reply) {
        try {
            return await loyaltyService.getPoints(request.user.id);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async redeemPoints(request, reply) {
        try {
            const { points } = request.body;
            return await loyaltyService.redeemPoints(request.user.id, points);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async applyReferral(request, reply) {
        try {
            const { code } = request.body;
            return await loyaltyService.applyReferral(code, request.user.id);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getReferralStats(request, reply) {
        try {
            return await loyaltyService.getReferralStats(request.user.id);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async checkBirthdayDiscount(request, reply) {
        try {
            return await loyaltyService.checkBirthdayDiscount(request.user.id);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
};

module.exports = loyaltyController;
