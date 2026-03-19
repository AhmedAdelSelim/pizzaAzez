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
        return await userRepository.update({ id: userId }, { vip_status: finalStatus });
    }
}

module.exports = new VipService();
