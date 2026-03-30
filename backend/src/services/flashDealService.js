const { userRepository } = require('../repositories');
const { getDb } = require('../config/db');

class FlashDealService {
    async getActiveDeals() {
        const now = new Date().toISOString();
        const { data, error } = await getDb()
            .from('flash_deals')
            .select('*')
            .eq('is_active', true)
            .gte('expires_at', now)
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data || [];
    }

    async getAllDeals() {
        const { data, error } = await getDb()
            .from('flash_deals')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data || [];
    }

    async createDeal(dealData) {
        dealData.id = 'DEAL-' + Date.now();
        dealData.is_active = true;
        dealData.created_at = new Date().toISOString();

        const { data, error } = await getDb()
            .from('flash_deals')
            .insert(dealData)
            .select()
            .single();
        if (error) throw new Error(error.message);

        // Notify all users async
        this.notifyUsers(data).catch(err => console.error('Flash deal notify error:', err));
        return data;
    }

    async deleteDeal(id) {
        const { error } = await getDb().from('flash_deals').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    async notifyUsers(deal) {
        const users = await userRepository.find({});
        const tokens = users.filter(u => u.is_active !== false).map(u => u.push_token).filter(Boolean);
        if (tokens.length === 0) return;
        const pushService = require('./pushService');
        await pushService.sendNotification(
            tokens,
            `⚡ عرض لفترة محدودة!`,
            `${deal.title} — خصم ${deal.discount_percent}٪ ينتهي قريباً!`,
            { type: 'flash_deal', dealId: deal.id }
        );
    }
}

module.exports = new FlashDealService();
