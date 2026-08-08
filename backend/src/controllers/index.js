const { authService, menuService, orderService, reviewService, profileService, miscService, couponService } = require('../services');
const sseService = require('../services/sseService');
const storyQuotaService = require('../services/storyQuotaService');

/** The master admin phone is treated as an admin even if the row says otherwise. */
const isAdminUser = (user) =>
    user?.role === 'admin' || user?.phone === (process.env.ADMIN_PHONE || '01021317616');

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
    async placeOrder(request, reply) {
        try {
            const loyaltyService = require('../services/loyaltyService');
            const order = await orderService.placeOrder({ ...request.body, user_id: request.user.id });
            const points_earned = await loyaltyService.awardPoints(request.user.id, order.total).catch(() => 0);
            return {
                order,
                estimatedTime: '٣٠-٤٥ دقيقة',
                points_earned,
            };
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
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

    async getStoryQuota(request, reply) {
        try {
            const { userRepository } = require('../repositories');
            const user = await userRepository.findOne({ id: request.user.id });
            if (!user) return reply.status(404).send({ message: 'المستخدم غير موجود' });

            // Admins post without limit, so report an unlimited quota rather
            // than a number the UI would count down.
            if (isAdminUser(user)) {
                return { unlimited: true, vipActive: true, remaining: null, used: 0, limit: null, bonus: 0 };
            }
            return { unlimited: false, ...storyQuotaService.getQuota(user) };
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async createStory(request, reply) {
        try {
            const { userRepository } = require('../repositories');
            const user = await userRepository.findOne({ id: request.user.id });
            if (!user) return reply.status(404).send({ message: 'المستخدم غير موجود' });

            const isAdmin = isAdminUser(user);
            const quota = storyQuotaService.getQuota(user);

            if (!isAdmin) {
                if (user.vip_status !== 'vip') {
                    return reply.status(403).send({
                        message: 'هذه الميزة متاحة لأعضاء VIP والمشرفين فقط',
                    });
                }
                // Subscription lapsed — drop the badge so the rest of the app
                // stops treating them as VIP, then refuse the post.
                if (!quota.vipActive) {
                    await userRepository.update({ id: user.id }, { vip_status: 'none' });
                    return reply.status(403).send({
                        message: 'انتهى اشتراكك الشهري في VIP. يرجى التجديد للاستمرار في نشر القصص.',
                        code: 'VIP_EXPIRED',
                    });
                }
                if (quota.remaining <= 0) {
                    return reply.status(403).send({
                        message: `لقد استخدمت ${quota.limit} قصص هذا الشهر. للحصول على قصص إضافية يرجى التواصل مع الإدارة.`,
                        code: 'STORY_QUOTA_EXCEEDED',
                        quota,
                    });
                }
            }

            const { image, title, bg_colors } = request.body;
            if (!image && !title) {
                return reply.status(400).send({ message: 'يرجى إرسال صورة أو نص' });
            }

            const story = await miscService.createStory({
                image,
                title,
                bg_colors,
                owner: user.name,
                owner_image: user.image || null,
                user_id: user.id,
            });

            // Only bill the quota once the story is safely stored.
            if (!isAdmin) await storyQuotaService.consume(user);

            sseService.sendToAll('new_story', story);
            return story;
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
