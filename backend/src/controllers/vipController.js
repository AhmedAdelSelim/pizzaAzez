const vipService = require('../services/vipService');

const vipController = {
    async requestVip(request, reply) {
        try {
            const userId = request.user.id;
            console.log('VIP Request for user:', userId);
            const result = await vipService.requestVip(userId);
            return reply.send({ success: true, user: result });
        } catch (error) {
            console.error('VIP Request Error:', error);
            return reply.status(400).send({ message: error.message });
        }
    },

    async getAdminVipRequests(request, reply) {
        try {
            const requests = await vipService.getPendingRequests();
            return reply.send(requests);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async handleVipRequest(request, reply) {
        try {
            const { userId, status } = request.body;
            if (!['vip', 'none'].includes(status)) {
                throw new Error('Invalid status. Must be vip or none.');
            }
            const result = await vipService.handleVipRequest(userId, status);
            return reply.send({ success: true, user: result });
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

module.exports = vipController;
