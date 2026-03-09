const {
    authController,
    menuController,
    orderController,
    profileController,
    miscController,
    couponController
} = require('../controllers');

async function routes(fastify, options) {
    // Auth
    fastify.post('/api/auth/login', authController.login);
    fastify.post('/api/auth/register', authController.register);

    // Menu
    fastify.get('/api/categories', menuController.getCategories);
    fastify.get('/api/menu', menuController.getMenu);
    fastify.get('/api/menu/:id', menuController.getMenuItem);

    // Orders
    fastify.post('/api/orders', orderController.placeOrder);
    fastify.get('/api/orders', orderController.getOrders);

    // Delivery Zones
    fastify.get('/api/delivery-zones', miscController.getDeliveryZones);

    // Stories
    fastify.get('/api/stories', miscController.getStories);

    // Profile
    fastify.get('/api/profile', profileController.getProfile);
    fastify.put('/api/profile', profileController.updateProfile);

    // Coupons
    fastify.post('/api/coupons/validate', couponController.validateCoupon);
}

module.exports = routes;

