const { orderRepository, menuItemRepository, storyRepository, userRepository, categoryRepository, couponRepository, deliveryZoneRepository } = require('../repositories');

class AdminService {
    async getOrders() {
        return await orderRepository.find({});
    }

    async updateOrderStatus(orderId, status) {
        return await orderRepository.update({ id: orderId }, { status });
    }

    async getMenuItems(categoryId) {
        const filter = categoryId ? { category_id: categoryId } : {};
        return await menuItemRepository.find(filter);
    }

    async addMenuItem(itemData) {
        itemData.id = 'MItem_' + Date.now();
        return await menuItemRepository.create(itemData);
    }

    async updateMenuItem(itemId, updates) {
        return await menuItemRepository.update({ id: itemId }, updates);
    }

    async deleteMenuItem(itemId) {
        return await menuItemRepository.delete({ id: itemId });
    }

    async getStories() {
        return await storyRepository.find({});
    }

    async addStory(storyData) {
        storyData.id = 'Story_' + Date.now();
        return await storyRepository.create(storyData);
    }

    async deleteStory(storyId) {
        return await storyRepository.delete({ id: storyId });
    }

    async getUsers() {
        return await userRepository.find({});
    }

    async updateUserStatus(userId, isActive) {
        return await userRepository.update({ id: userId }, { is_active: isActive });
    }

    // Categories
    async getCategories() {
        return await categoryRepository.find({});
    }
    async addCategory(data) {
        data.id = 'Cat_' + Date.now();
        return await categoryRepository.create(data);
    }
    async deleteCategory(id) {
        return await categoryRepository.delete({ id });
    }

    // Coupons
    async getCoupons() {
        return await couponRepository.find({});
    }
    async addCoupon(data) {
        data.code = data.code.toUpperCase();
        return await couponRepository.create(data);
    }
    async deleteCoupon(id) {
        return await couponRepository.delete({ id });
    }

    // Delivery Zones
    async getDeliveryZones() {
        return await deliveryZoneRepository.find({});
    }
    async addDeliveryZone(data) {
        data.id = 'Zone_' + Date.now();
        return await deliveryZoneRepository.create(data);
    }
    async updateDeliveryZone(id, updates) {
        return await deliveryZoneRepository.update({ id }, updates);
    }
    async deleteDeliveryZone(id) {
        return await deliveryZoneRepository.delete({ id });
    }

    // Stats
    async getStats() {
        const orders = await orderRepository.find({});
        const users = await userRepository.find({});
        const revenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        
        const activeUsers = await this.getActiveUsers(orders, users);
        
        return {
            totalOrders: orders.length,
            totalUsers: users.length,
            totalRevenue: revenue,
            pendingOrders: orders.filter(o => o.status === 'preparing' || o.status === 'on_the_way').length,
            pendingVipRequests: users.filter(u => u.vip_status === 'pending').length,
            activeUsers
        };
    }

    async getActiveUsers(orders, allUsers) {
        const userStats = {};
        
        orders.forEach(order => {
            // Use user_id if available, otherwise fallback to phone
            const identifier = order.user_id || order.phone;
            if (!identifier) return;

            if (!userStats[identifier]) {
                userStats[identifier] = {
                    count: 0,
                    name: order.customer_name || 'عميل',
                    phone: order.phone || '-'
                };
            }
            userStats[identifier].count++;
        });

        const activeUsers = Object.entries(userStats)
            .map(([id, stats]) => {
                // Find real user by ID OR by phone (since id could be either due to fallback)
                const user = allUsers.find(u => u.id === id || u.phone === id);
                return {
                    id,
                    name: user?.name || stats.name || 'مستخدم غير معروف',
                    phone: user?.phone || stats.phone || '-',
                    orderCount: stats.count
                };
            })
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 5); // Top 5

        return activeUsers;
    }

    async getDailyStats() {
        const orders = await orderRepository.find({});
        const dailyData = {};

        orders.forEach(order => {
            const date = order.date; // already in YYYY-MM-DD
            if (!dailyData[date]) {
                dailyData[date] = { date, total: 0, completed: 0, cancelled: 0, revenue: 0 };
            }
            dailyData[date].total++;
            if (order.status === 'delivered') {
                dailyData[date].completed++;
                dailyData[date].revenue += (parseFloat(order.total) || 0);
            }
            if (order.status === 'cancelled') dailyData[date].cancelled++;
        });

        // Convert to array and sort by date descending
        return Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

module.exports = AdminService;
