const {
    authController,
    menuController,
    orderController,
    profileController,
    miscController,
    couponController,
    adminController
} = require('../controllers');
const { userRepository } = require('../repositories');

async function routes(fastify, options) {
    // Public Routes - Auth
    fastify.post('/api/auth/login', authController.login);
    fastify.post('/api/auth/register', authController.register);

    // Public Routes - General Content
    fastify.get('/api/categories', menuController.getCategories);
    fastify.get('/api/menu', menuController.getMenu);
    fastify.get('/api/menu/:id', menuController.getMenuItem);
    fastify.get('/api/delivery-zones', miscController.getDeliveryZones);
    fastify.get('/api/stories', miscController.getStories);

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

        // Orders
        protectedFastify.post('/api/orders', orderController.placeOrder);
        protectedFastify.get('/api/orders', orderController.getOrders);

        // Profile
        protectedFastify.get('/api/profile', profileController.getProfile);
        protectedFastify.put('/api/profile', profileController.updateProfile);

        // Coupons
        protectedFastify.post('/api/coupons/validate', couponController.validateCoupon);

        // Admin Routes
        protectedFastify.register(async function (adminFastify, opts) {
            adminFastify.addHook('onRequest', async (request, reply) => {
                const user = await userRepository.findOne({ id: request.user.id });
                if (user && user.phone === '01021317616') {
                    user.role = 'admin'; // Override role if it's the master admin
                }
                
                if (!user || user.role !== 'admin') {
                    return reply.status(403).send({ message: 'Forbidden: Admins only' });
                }
            });

            adminFastify.get('/api/admin/orders', adminController.getOrders);
            adminFastify.put('/api/admin/orders/:id/status', adminController.updateOrderStatus);
            adminFastify.get('/api/admin/menu', adminController.getMenuItems);
            adminFastify.post('/api/admin/menu', adminController.addMenuItem);
            adminFastify.put('/api/admin/menu/:id', adminController.updateMenuItem);
            adminFastify.delete('/api/admin/menu/:id', adminController.deleteMenuItem);

            adminFastify.get('/api/admin/stories', adminController.getStories);
            adminFastify.post('/api/admin/stories', adminController.addStory);
            adminFastify.delete('/api/admin/stories/:id', adminController.deleteStory);

            adminFastify.get('/api/admin/users', adminController.getUsers);
            adminFastify.put('/api/admin/users/:id/status', adminController.updateUserStatus);

            adminFastify.get('/api/admin/categories', adminController.getCategories);
            adminFastify.post('/api/admin/categories', adminController.addCategory);
            adminFastify.delete('/api/admin/categories/:id', adminController.deleteCategory);

            adminFastify.get('/api/admin/coupons', adminController.getCoupons);
            adminFastify.post('/api/admin/coupons', adminController.addCoupon);
            adminFastify.delete('/api/admin/coupons/:id', adminController.deleteCoupon);

            adminFastify.get('/api/admin/delivery-zones', adminController.getDeliveryZones);
            adminFastify.post('/api/admin/delivery-zones', adminController.addDeliveryZone);
            adminFastify.put('/api/admin/delivery-zones/:id', adminController.updateDeliveryZone);
            adminFastify.delete('/api/admin/delivery-zones/:id', adminController.deleteDeliveryZone);

            adminFastify.get('/api/admin/stats', adminController.getStats);
            adminFastify.get('/api/admin/stats/daily', adminController.getDailyStats);
        });
    });
}

module.exports = routes;

