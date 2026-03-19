const { userRepository } = require('../repositories');

class VipService {
    async requestVip(userId) {
        return await userRepository.update({ id: userId }, { vip_status: 'pending' });
    }

    async getPendingRequests() {
        return await userRepository.find({ vip_status: 'pending' });
    }

    async handleVipRequest(userId, status) {
        // status should be 'vip' or 'none' (declined)
        const finalStatus = status === 'vip' ? 'vip' : 'none';
        return await userRepository.update({ id: userId }, { vip_status: finalStatus });
    }
}

module.exports = new VipService();
