const { adminService } = require('../services');
const sseService = require('../services/sseService');
const storyQuotaService = require('../services/storyQuotaService');

const adminController = {
    async getOrders(request, reply) {
        try {
            return await adminService.getOrders();
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
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
            const { title, image, active, bg_colors, owner, owner_image } = request.body;
            // Persist first: broadcasting a story that was never stored is why
            // admin stories used to vanish on refresh.
            const story = await adminService.addStory({
                title: title || null,
                image: image || null,
                active: active !== false,
                bg_colors: bg_colors || null,
                owner: owner || 'Admin',
                owner_image: owner_image || null,
            });
            sseService.sendToAll('new_story', story);
            return story;
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async deleteStory(request, reply) {
        try {
            const { id } = request.params;
            await adminService.deleteStory(id);
            sseService.sendToAll('story_deleted', { id });
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

    // Extra stories for a VIP who has run through the monthly allowance and
    // phoned in. Credits apply to the current month only.
    async grantStoryCredits(request, reply) {
        try {
            const { id } = request.params;
            const { credits } = request.body;
            const user = await storyQuotaService.grantCredits(id, credits);
            return { user, quota: storyQuotaService.getQuota(user) };
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
    },

    async getDailyStats(request, reply) {
        try {
            const result = await adminService.getDailyStats();
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async toggleMenuItemAvailability(request, reply) {
        try {
            const { id } = request.params;
            const { is_available } = request.body;
            const result = await adminService.toggleMenuItemAvailability(id, is_available);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async broadcastNotification(request, reply) {
        try {
            const { title, body } = request.body;
            if (!title || !body) return reply.status(400).send({ message: 'العنوان والمحتوى مطلوبان' });
            const result = await adminService.broadcastNotification(title, body);
            reply.send(result);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
};

module.exports = adminController;
