const { orderRepository, menuItemRepository, storyRepository, userRepository, categoryRepository, couponRepository, deliveryZoneRepository } = require('../repositories');
const sseService = require('./sseService');
const { ORDER_STATUS, isValidStatus } = require('../constants/orderStatus');
const { attachCustomerNames } = require('../utils/customerName');

class AdminService {
    async getOrders() {
        const orders = await orderRepository.find({});
        return await attachCustomerNames(orders);
    }

    async updateOrderStatus(orderId, status) {
        if (!isValidStatus(status)) throw new Error('حالة الطلب غير صالحة');

        const existing = await orderRepository.findOne({ id: orderId });
        if (!existing) throw new Error('الطلب غير موجود');
        if (existing.status === status) return existing;

        // A finished order is finished — reopening a delivered or cancelled
        // order would resurrect it on the customer's screen.
        if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(existing.status)) {
            throw new Error('لا يمكن تعديل حالة طلب منتهٍ');
        }

        const result = await orderRepository.update({ id: orderId }, { status });
        // Push notification to the order owner
        this.notifyOrderUser(result, status).catch(() => {});
        // Real-time event to the order owner
        if (result.user_id) {
            sseService.sendToUser(result.user_id, 'order_status', {
                orderId: result.id,
                status,
                order: result,
            });
        }
        // Notify all connected admins so their list refreshes too
        sseService.sendToAdmins('order_updated', { orderId: result.id, status });
        return result;
    }

    async notifyOrderUser(order, status) {
        if (!order.user_id) return;
        const user = await userRepository.findOne({ id: order.user_id });
        if (!user?.push_token) return;
        const statusMessages = {
            preparing: { title: 'جاري التحضير 👨‍🍳', body: `طلبك #${order.id.slice(-6)} جاري تحضيره الآن!` },
            baking:    { title: 'في الفرن 🔥',        body: `طلبك #${order.id.slice(-6)} يُخبز الآن!` },
            shipping:  { title: 'في الطريق 🛵',        body: `طلبك #${order.id.slice(-6)} خرج للتوصيل!` },
            delivered: { title: 'تم التوصيل ✅',       body: `تم تسليم طلبك #${order.id.slice(-6)}. شهية طيبة!` },
            cancelled: { title: 'تم الإلغاء ❌',       body: `تم إلغاء طلبك #${order.id.slice(-6)}.` },
        };
        const msg = statusMessages[status];
        if (!msg) return;
        const pushService = require('./pushService');
        await pushService.sendNotification([user.push_token], msg.title, msg.body, { orderId: order.id });
    }

    async getMenuItems(categoryId) {
        const filter = categoryId ? { category_id: categoryId } : {};
        return await menuItemRepository.find(filter);
    }

    async addMenuItem(itemData) {
        const toNullIfEmpty = v => (v === '' || v === undefined) ? null : v;
        const toIntOrNull   = v => { const n = parseInt(v); return isNaN(n) ? null : n; };

        const item = {
            id:               'MItem_' + Date.now(),
            name:             itemData.name,
            description:      toNullIfEmpty(itemData.description),
            price:            parseFloat(itemData.price),
            category_id:      itemData.category_id,
            image:            toNullIfEmpty(itemData.image),
            calories:         toIntOrNull(itemData.calories),
            preparation_time: toNullIfEmpty(itemData.preparation_time),
            is_available:     itemData.is_available !== false,
            rating:           itemData.rating ?? 0,
        };

        return await menuItemRepository.create(item);
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
        storyData.created_at = new Date().toISOString();
        return await storyRepository.create(storyData);
    }

    async deleteStory(storyId) {
        return await storyRepository.delete({ id: storyId });
    }

    async getUsers() {
        const users = await userRepository.find({});
        // Attach the derived story quota so the admin list doesn't have to
        // reimplement month-rollover rules client-side.
        const storyQuotaService = require('./storyQuotaService');
        const { sanitizeUser } = require('../utils/sanitizeUser');
        return users.map((user) => ({
            ...sanitizeUser(user),
            story_quota: storyQuotaService.getQuota(user),
        }));
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
                    // getStats() reads raw order rows, which carry no
                    // customer_name — the real name is resolved from allUsers
                    // below, and this only covers an order whose account is gone.
                    name: 'عميل',
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

    async toggleMenuItemAvailability(itemId, is_available) {
        return await menuItemRepository.update({ id: itemId }, { is_available });
    }

    async broadcastNotification(title, body) {
        const users = await userRepository.find({});
        const tokens = users.filter(u => u.is_active !== false).map(u => u.push_token).filter(t => !!t);
        if (tokens.length === 0) return { sent: 0 };
        const pushService = require('./pushService');
        await pushService.sendNotification(tokens, title, body, {});
        return { sent: tokens.length };
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
