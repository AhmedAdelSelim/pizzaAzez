const { orderRepository, menuItemRepository } = require('../repositories');

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
}

module.exports = AdminService;
