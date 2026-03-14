const { adminService } = require('../services');

const adminController = {
    async getOrders() {
        return await adminService.getOrders();
    },

    async updateOrderStatus(request, reply) {
        try {
            const { id } = request.params;
            const { status } = request.body;
            return await adminService.updateOrderStatus(id, status);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getMenuItems(request, reply) {
        try {
            const { categoryId } = request.query;
            return await adminService.getMenuItems(categoryId);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async addMenuItem(request, reply) {
        try {
            return await adminService.addMenuItem(request.body);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async updateMenuItem(request, reply) {
        try {
            const { id } = request.params;
            return await adminService.updateMenuItem(id, request.body);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async deleteMenuItem(request, reply) {
        try {
            const { id } = request.params;
            await adminService.deleteMenuItem(id);
            return { success: true };
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

module.exports = adminController;
