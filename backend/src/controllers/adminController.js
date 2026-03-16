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
    },

    async getStories(request, reply) {
        try {
            return await adminService.getStories();
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async addStory(request, reply) {
        try {
            return await adminService.addStory(request.body);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async deleteStory(request, reply) {
        try {
            const { id } = request.params;
            await adminService.deleteStory(id);
            return { success: true };
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getUsers(request, reply) {
        try {
            return await adminService.getUsers();
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async updateUserStatus(request, reply) {
        try {
            const { id } = request.params;
            const { isActive } = request.body;
            const result = await adminService.updateUserStatus(id, isActive);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getCategories(request, reply) {
        try {
            const result = await adminService.getCategories();
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async addCategory(request, reply) {
        try {
            const result = await adminService.addCategory(request.body);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async deleteCategory(request, reply) {
        try {
            const result = await adminService.deleteCategory(request.params.id);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getCoupons(request, reply) {
        try {
            const result = await adminService.getCoupons();
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async addCoupon(request, reply) {
        try {
            const result = await adminService.addCoupon(request.body);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async deleteCoupon(request, reply) {
        try {
            const result = await adminService.deleteCoupon(request.params.id);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getDeliveryZones(request, reply) {
        try {
            const result = await adminService.getDeliveryZones();
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async addDeliveryZone(request, reply) {
        try {
            const result = await adminService.addDeliveryZone(request.body);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async updateDeliveryZone(request, reply) {
        try {
            const result = await adminService.updateDeliveryZone(request.params.id, request.body);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
    async deleteDeliveryZone(request, reply) {
        try {
            const result = await adminService.deleteDeliveryZone(request.params.id);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getStats(request, reply) {
        try {
            const result = await adminService.getStats();
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

module.exports = adminController;
