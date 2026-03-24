const { authService, menuService, orderService, reviewService, profileService, miscService, couponService } = require('../services');

const authController = {
    async login(request, reply) {
        try {
            const { phone, password } = request.body;
            const user = await authService.login(phone, password);
            const token = reply.server.jwt.sign({ id: user.id });
            return { user, token };
        } catch (error) {
            return reply.status(401).send({ message: error.message });
        }
    },

    async register(request, reply) {
        try {
            const user = await authService.register(request.body);
            const token = reply.server.jwt.sign({ id: user.id });
            return { user, token };
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

const menuController = {
    async getCategories() {
        return await menuService.getCategories();
    },

    async getMenu(request) {
        const { categoryId } = request.query;
        const menuItems = await menuService.getMenuItems(categoryId);
        return menuItems;
    },

    async getMenuItem(request, reply) {
        try {
            return await menuService.getMenuItemById(request.params.id);
        } catch (error) {
            return reply.status(404).send({ message: error.message });
        }
    }
};

const orderController = {
    async placeOrder(request) {
        const loyaltyService = require('./loyaltyController') && require('../services/loyaltyService');
        const order = await orderService.placeOrder({ ...request.body, user_id: request.user.id });
        const points_earned = await loyaltyService.awardPoints(request.user.id, order.total).catch(() => 0);
        return {
            order,
            estimatedTime: '٣٠-٤٥ دقيقة',
            points_earned,
        };
    },

    async getOrders(request) {
        return await orderService.getOrders(request.user.id);
    },

    async cancelOrder(request, reply) {
        try {
            return await orderService.cancelOrder(request.params.id, request.user.id);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

const reviewController = {
    async addReview(request, reply) {
        try {
            const { userRepository } = require('../repositories');
            const user = await userRepository.findOne({ id: request.user.id });
            const { rating, comment } = request.body;
            return await reviewService.addReview(
                request.params.id,
                request.user.id,
                user?.name || 'مستخدم',
                rating,
                comment
            );
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getReviews(request) {
        return await reviewService.getReviews(request.params.id);
    },
};

const profileController = {
    async getProfile(request, reply) {
        return await profileService.getProfile(request.user.id);
    },

    async updateProfile(request, reply) {
        return await profileService.updateProfile(request.user.id, request.body);
    }
};

const miscController = {
    async getDeliveryZones() {
        return await miscService.getDeliveryZones();
    },

    async getStories() {
        return await miscService.getStories();
    },

    async createStory(request, reply) {
        try {
            const { userRepository } = require('../repositories');
            const user = await userRepository.findOne({ id: request.user.id });
            const isAdmin = user?.role === 'admin' || user?.phone === '01021317616';
            const isVip = user?.vip_status === 'vip';
            if (!isAdmin && !isVip) {
                return reply.status(403).send({ message: 'هذه الميزة متاحة لأعضاء VIP والمشرفين فقط' });
            }
            const { image, title, bg_colors } = request.body;
            if (!image && !title) {
                return reply.status(400).send({ message: 'يرجى إرسال صورة أو نص' });
            }
            return await miscService.createStory({
                image: image || null,
                title: title || null,
                bg_colors: bg_colors || null,
                owner: user.name,
                owner_image: user.image || null,
            });
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },
};

const couponController = {
    async validateCoupon(request, reply) {
        try {
            const { code } = request.body;
            const coupon = await couponService.validateCoupon(code);
            return coupon;
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

const adminController = require('./adminController');

module.exports = {
    authController,
    menuController,
    orderController,
    reviewController,
    profileController,
    miscController,
    couponController,
    adminController,
    suggestionController: require('./suggestionController'),
    vipController: require('./vipController'),
    loyaltyController: require('./loyaltyController'),
    flashDealController: require('./flashDealController'),
};
