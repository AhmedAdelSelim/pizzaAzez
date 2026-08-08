const {
    authController,
    menuController,
    orderController,
    reviewController,
    profileController,
    miscController,
    couponController,
    adminController,
    suggestionController,
    vipController,
    loyaltyController,
    flashDealController,
} = require('../controllers');
const { userRepository } = require('../repositories');
const sseService = require('../services/sseService');

/**
 * Recursively drop `password` from anything on its way out.
 *
 * Services sanitize their own returns, but this is the backstop: a new endpoint
 * that forgets to, or a nested user object inside some other payload, still
 * can't leak a hash.
 */
function stripPasswords(value) {
    if (Array.isArray(value)) return value.map(stripPasswords);
    if (value && typeof value === 'object') {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
            if (key === 'password') continue;
            out[key] = stripPasswords(nested);
        }
        return out;
    }
    return value;
}

async function routes(fastify, options) {
    fastify.addHook('preSerialization', async (request, reply, payload) => stripPasswords(payload));

    // Public Routes - Auth
    fastify.post('/api/auth/login', authController.login);
    fastify.post('/api/auth/register', authController.register);

    // Public Routes - General Content
    fastify.get('/api/categories', menuController.getCategories);
    fastify.get('/api/menu', menuController.getMenu);
    fastify.get('/api/menu/:id', menuController.getMenuItem);
    fastify.get('/api/menu/:id/reviews', reviewController.getReviews);
    fastify.get('/api/delivery-zones', miscController.getDeliveryZones);
    fastify.get('/api/stories', miscController.getStories);
    fastify.get('/api/flash-deals', flashDealController.getActiveDeals);

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

        // ── Realtime stream ──────────────────────────────────────────────────
        // Server-sent events. The client can't pick what it subscribes to — the
        // token decides: everyone gets their own order updates and broadcasts,
        // admins additionally get the admin feed.
        protectedFastify.get('/api/events', async (request, reply) => {
            const user = await userRepository.findOne({ id: request.user.id });
            const isAdmin =
                user?.role === 'admin' ||
                user?.phone === (process.env.ADMIN_PHONE || '01021317616');

            const { stream, cleanup } = sseService.createStream(request.user.id, isAdmin);

            // Close the stream when the client goes away, otherwise dead
            // PassThroughs accumulate for the life of the worker.
            request.raw.on('close', cleanup);

            reply
                .header('Content-Type', 'text/event-stream')
                .header('Cache-Control', 'no-cache, no-transform')
                .header('Connection', 'keep-alive')
                // Nginx buffers text/event-stream by default, which stalls delivery.
                .header('X-Accel-Buffering', 'no');

            stream.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

            // Comment lines keep intermediaries from timing the socket out.
            const heartbeat = setInterval(() => {
                try {
                    stream.write(': ping\n\n');
                } catch {
                    clearInterval(heartbeat);
                }
            }, 25000);
            request.raw.on('close', () => clearInterval(heartbeat));

            return reply.send(stream);
        });

        // Orders
        protectedFastify.post('/api/orders', orderController.placeOrder);
        protectedFastify.get('/api/orders', orderController.getOrders);
        protectedFastify.put('/api/orders/:id/cancel', orderController.cancelOrder);

        // Reviews
        protectedFastify.post('/api/menu/:id/review', reviewController.addReview);

        // Profile
        protectedFastify.get('/api/profile', profileController.getProfile);
        protectedFastify.put('/api/profile', profileController.updateProfile);

        // Coupons
        protectedFastify.post('/api/coupons/validate', couponController.validateCoupon);

        // Stories (VIP + Admin)
        protectedFastify.post('/api/stories', miscController.createStory);
        protectedFastify.get('/api/stories/quota', miscController.getStoryQuota);

        // Suggestions
        protectedFastify.post('/api/suggestions', suggestionController.createSuggestion);

        // VIP Request
        protectedFastify.post('/api/vip/request', vipController.requestVip);

        // Loyalty Points
        protectedFastify.get('/api/loyalty', loyaltyController.getPoints);
        protectedFastify.post('/api/loyalty/redeem', loyaltyController.redeemPoints);
        protectedFastify.post('/api/loyalty/referral', loyaltyController.applyReferral);
        protectedFastify.get('/api/loyalty/referral-stats', loyaltyController.getReferralStats);
        protectedFastify.get('/api/loyalty/birthday', loyaltyController.checkBirthdayDiscount);

        // Admin Routes
        protectedFastify.register(async function (adminFastify, opts) {
            adminFastify.addHook('onRequest', async (request, reply) => {
                const user = await userRepository.findOne({ id: request.user.id });
                if (user && user.phone === (process.env.ADMIN_PHONE || '01021317616')) {
                    user.role = 'admin'; // Override role if it's the master admin
                }
                
                if (!user || user.role !== 'admin') {
                    return reply.status(403).send({ message: 'Forbidden: Admins only' });
                }
            });

            adminFastify.get('/api/admin/suggestions', suggestionController.getAdminSuggestions);
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
            adminFastify.post('/api/admin/users/:id/story-credits', adminController.grantStoryCredits);

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

            // VIP Requests
            adminFastify.get('/api/admin/vip-requests', vipController.getAdminVipRequests);
            adminFastify.post('/api/admin/vip-requests/handle', vipController.handleVipRequest);

            // Flash Deals
            adminFastify.get('/api/admin/flash-deals', flashDealController.getAllDeals);
            adminFastify.post('/api/admin/flash-deals', flashDealController.createDeal);
            adminFastify.delete('/api/admin/flash-deals/:id', flashDealController.deleteDeal);

            // Menu item availability toggle
            adminFastify.put('/api/admin/menu/:id/availability', adminController.toggleMenuItemAvailability);

            // Broadcast notification
            adminFastify.post('/api/admin/broadcast', adminController.broadcastNotification);
        });
    });
}

module.exports = routes;

