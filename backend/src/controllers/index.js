const { authService, menuService, orderService, profileService, miscService, couponService } = require('../services');

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
        const order = await orderService.placeOrder(request.body);
        return {
            order,
            estimatedTime: '٣٠-٤٥ دقيقة',
        };
    },

    async getOrders() {
        return await orderService.getOrders();
    }
};

const profileController = {
    async getProfile() {
        return await profileService.getProfile();
    },

    async updateProfile(request) {
        return await profileService.updateProfile(request.body);
    }
};

const miscController = {
    async getDeliveryZones() {
        return await miscService.getDeliveryZones();
    },

    async getStories() {
        return await miscService.getStories();
    }
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
    profileController,
    miscController,
    couponController,
    adminController,
    suggestionController: require('./suggestionController'),
    vipController: require('./vipController')
};
