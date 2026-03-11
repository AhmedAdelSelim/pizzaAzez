const {
    authController,
    menuController,
    orderController,
    profileController,
    miscController,
    couponController
} = require('../controllers');

async function routes(fastify, options) {
    // Public Routes - Auth
    fastify.post('/api/auth/login', authController.login);
    fastify.post('/api/auth/register', authController.register);

    // Protected Routes
    fastify.register(async function (protectedFastify, opts) {
        
        // Add authentication hook for all routes in this context
        protectedFastify.addHook('onRequest', async (request, reply) => {
            try {
                await request.jwtVerify()
            } catch (err) {
                reply.send(err)
            }
        });

        // Menu
        protectedFastify.get('/api/categories', menuController.getCategories);
        protectedFastify.get('/api/menu', menuController.getMenu);
        protectedFastify.get('/api/menu/:id', menuController.getMenuItem);

        // Orders
        protectedFastify.post('/api/orders', orderController.placeOrder);
        protectedFastify.get('/api/orders', orderController.getOrders);

        // Delivery Zones
        protectedFastify.get('/api/delivery-zones', miscController.getDeliveryZones);

        // Stories
        protectedFastify.get('/api/stories', miscController.getStories);

        // Profile
        protectedFastify.get('/api/profile', profileController.getProfile);
        protectedFastify.put('/api/profile', profileController.updateProfile);

        // Coupons
        protectedFastify.post('/api/coupons/validate', couponController.validateCoupon);
    });
}

module.exports = routes;

