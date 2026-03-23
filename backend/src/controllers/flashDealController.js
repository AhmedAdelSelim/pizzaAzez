const flashDealService = require('../services/flashDealService');

const flashDealController = {
    async getActiveDeals(request, reply) {
        try {
            return await flashDealService.getActiveDeals();
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getAllDeals(request, reply) {
        try {
            return await flashDealService.getAllDeals();
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async createDeal(request, reply) {
        try {
            return await flashDealService.createDeal(request.body);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async deleteDeal(request, reply) {
        try {
            await flashDealService.deleteDeal(request.params.id);
            return { success: true };
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
};

module.exports = flashDealController;
