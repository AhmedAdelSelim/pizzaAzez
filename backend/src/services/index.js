const {
    userRepository,
    categoryRepository,
    menuItemRepository,
    orderRepository,
    deliveryZoneRepository,
    storyRepository,
    couponRepository,
    reviewRepository,
} = require('../repositories');
const sseService = require('./sseService');
const { ORDER_STATUS, isCancellable } = require('../constants/orderStatus');
const { hash: hashPassword, verify: verifyPassword } = require('../utils/password');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { validateUsername } = require('../utils/username');

/**
 * Case-insensitive username lookup.
 *
 * The repository's `.eq` is case-sensitive, and the unique index is on
 * `lower(username)` — so a plain equality check would let "Ahmed" through when
 * "ahmed" exists, only for the insert to fail with a raw Postgres error.
 * This exists to produce a readable message; the index is still the real guard
 * against a race between two simultaneous signups.
 */
async function isUsernameTaken(username) {
    const { getDb } = require('../config/db');
    const { data, error } = await getDb()
        .from('users')
        .select('id')
        .ilike('username', username)
        .limit(1);
    if (error) throw new Error(error.message);
    return (data || []).length > 0;
}
const { attachCustomerName } = require('../utils/customerName');

class AuthService {
    async login(phone, password) {
        const user = await userRepository.findOne({ phone });

        // Same message whether the phone is unknown or the password is wrong,
        // so the response can't be used to enumerate registered numbers.
        const invalid = new Error('رقم الهاتف أو كلمة المرور غير صحيحة');
        if (!user) throw invalid;

        const { ok, needsUpgrade } = await verifyPassword(password, user.password);
        if (!ok) throw invalid;

        // Checked after the password so a wrong guess can't reveal that an
        // account exists but is suspended.
        if (user.is_active === false) throw new Error('تم تعطيل حسابك. يرجى مراجعة الإدارة.');

        const updates = {};

        // Quietly replace a legacy plaintext password with a real hash now that
        // we have the cleartext in hand and know it is correct.
        if (needsUpgrade) updates.password = await hashPassword(password);

        if (phone === (process.env.ADMIN_PHONE || '01021317616') && user.role !== 'admin') {
            updates.role = 'admin';
        }

        if (Object.keys(updates).length) {
            await userRepository.update({ id: user.id }, updates);
            Object.assign(user, updates);
        }
        if (phone === (process.env.ADMIN_PHONE || '01021317616')) user.role = 'admin';

        return sanitizeUser(user);
    }

    async register(userData) {
        const existing = await userRepository.findOne({ phone: userData.phone });
        if (existing) throw new Error('رقم الهاتف مسجل بالفعل');

        if (!userData.password) throw new Error('كلمة المرور مطلوبة');

        const username = validateUsername(userData.username);
        if (!username.ok) throw new Error(username.message);
        if (await isUsernameTaken(username.value)) {
            throw new Error('اسم المستخدم مستخدم بالفعل');
        }

        const savedUser = await userRepository.create({
            ...userData,
            username: username.value,
            id: 'user_' + Date.now(),
            password: await hashPassword(userData.password),
        });

        if (savedUser.phone === (process.env.ADMIN_PHONE || '01021317616')) {
            savedUser.role = 'admin';
        }
        return sanitizeUser(savedUser);
    }
}

class MenuService {
    async getCategories() {
        return await categoryRepository.find({});
    }

    async getMenuItems(categoryId) {
        const filter = categoryId ? { category_id: categoryId } : {};
        const items = await menuItemRepository.find(filter);
        return items.filter(item => item.is_available !== false);
    }

    async getMenuItemById(id) {
        const item = await menuItemRepository.findOne({ id });
        if (!item) throw new Error('العنصر غير موجود');
        return item;
    }
}

class OrderService {
    async placeOrder(orderData) {
        // A delivery order the kitchen can't deliver is worthless, and until now
        // nothing stopped one being created — the web form checked, but the API
        // did not, so any other client could omit these.
        const address = String(orderData.address || '').trim();
        const phone = String(orderData.phone || '').trim();
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new Error('لا توجد أصناف في الطلب');
        }
        if (!address) throw new Error('العنوان مطلوب لإتمام الطلب');
        if (!phone) throw new Error('رقم الهاتف مطلوب لإتمام الطلب');
        orderData.address = address;
        orderData.phone = phone;

        orderData.id = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        orderData.date = new Date().toISOString().split('T')[0];
        // A new order starts as received. Only an admin moves it forward from
        // here (see adminService.updateOrderStatus).
        orderData.status = ORDER_STATUS.RECEIVED;
        const paymentMethod = orderData.paymentMethod || 'cod';
        // Map camelCase fields to snake_case for the DB
        const dbData = {
            id: orderData.id,
            user_id: orderData.user_id,
            date: orderData.date,
            status: orderData.status,
            total: orderData.total,
            items: orderData.items,
            address: orderData.address,
            phone: orderData.phone,
            notes: orderData.notes,
            delivery_zone: orderData.deliveryZone,
            delivery_fee: orderData.deliveryFee,
            discount: orderData.discount,
            coupon_code: orderData.couponCode,
        };
        const created = await orderRepository.create(dbData);
        // The admin list prepends this payload as-is, so it has to carry the
        // customer name the same way a fetched order does — otherwise a live
        // order shows no name until the next refresh.
        const result = await attachCustomerName(created);
        result.payment_method = paymentMethod;

        // Push notification to admins
        this.notifyAdmins(result).catch(err => console.error('Notification error:', err));

        // Real-time event to all connected admins — send the full order so the
        // admin screen can prepend it without a refetch.
        sseService.sendToAdmins('new_order', result);

        return result;
    }

    async notifyAdmins(order) {
        try {
            const admins = await userRepository.find({ role: 'admin' });
            const tokens = admins.filter(a => a.is_active !== false).map(admin => admin.push_token).filter(token => !!token);
            
            if (tokens.length > 0) {
                const pushService = require('./pushService');
                await pushService.sendNotification(
                    tokens,
                    'طلب جديد! 🍕',
                    `يوجد طلب جديد رقم #${order.id.substring(0, 8)} بمبلغ ${order.total} ج.م`,
                    { orderId: order.id }
                );
            }
        } catch (error) {
            console.error('Error in notifyAdmins:', error);
        }
    }

    async getOrders(userId) {
        return await orderRepository.find({ user_id: userId });
    }

    async cancelOrder(orderId, userId) {
        const order = await orderRepository.findOne({ id: orderId });
        if (!order) throw new Error('الطلب غير موجود');
        if (order.user_id !== userId) throw new Error('غير مصرح');

        // Customers do not cancel their own orders — see isCancellable. Enforced
        // here rather than only in the UI, so removing the button is not the only
        // thing standing in the way of a crafted request.
        if (!isCancellable(order.status)) {
            throw new Error('لا يمكن إلغاء الطلب من التطبيق. يرجى الاتصال بالمطعم.');
        }

        const result = await orderRepository.update(
            { id: orderId },
            { status: ORDER_STATUS.CANCELLED }
        );

        // Admin dashboards should drop it from the active list immediately.
        sseService.sendToAdmins('order_updated', {
            orderId: result.id,
            status: ORDER_STATUS.CANCELLED,
        });
        return result;
    }
}

class ReviewService {
    async addReview(menuItemId, userId, userName, rating, comment) {
        const existing = await reviewRepository.findOne({ menu_item_id: menuItemId, user_id: userId });
        if (existing) throw new Error('لقد قمت بتقييم هذا الصنف مسبقاً');
        const review = await reviewRepository.create({
            id: 'REV_' + Date.now(),
            menu_item_id: menuItemId,
            user_id: userId,
            user_name: userName,
            rating: Math.min(5, Math.max(1, rating)),
            comment: comment || '',
            created_at: new Date().toISOString(),
        });
        // Update item average rating
        const reviews = await reviewRepository.find({ menu_item_id: menuItemId });
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        await menuItemRepository.update({ id: menuItemId }, { rating: Math.round(avg * 10) / 10 });
        return review;
    }

    async getReviews(menuItemId) {
        return await reviewRepository.find({ menu_item_id: menuItemId });
    }
}

class ProfileService {
    async getProfile(userId) {
        return sanitizeUser(await userRepository.findOne({ id: userId }));
    }

    async updateProfile(userId, updates) {
        const safeUpdates = { ...updates };

        // Never let a client promote itself or hand over an unhashed password.
        delete safeUpdates.id;
        delete safeUpdates.role;
        // Changing a username needs the same format and uniqueness checks that
        // registration runs, so it is not editable through this endpoint.
        delete safeUpdates.username;
        delete safeUpdates.vip_status;
        delete safeUpdates.vip_expires_at;
        delete safeUpdates.stories_used;
        delete safeUpdates.bonus_story_credits;

        if (safeUpdates.password) {
            safeUpdates.password = await hashPassword(safeUpdates.password);
        } else {
            delete safeUpdates.password;
        }

        return sanitizeUser(await userRepository.update({ id: userId }, safeUpdates));
    }
}

class MiscService {
    async getDeliveryZones() {
        return await deliveryZoneRepository.find({});
    }

    async getStories() {
        // Expired stories are removed by the hourly cleanup job (cleanupService.js).
        // Only return stories created within the last 24 h as a safety filter.
        const { getDb } = require('../config/db');
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const db = getDb();
        const { data, error } = await db
            .from('stories')
            .select('*')
            .gte('created_at', cutoff)
            .eq('active', true);
        if (error) throw new Error(error.message);
        return data || [];
    }

    async createStory({ image, title, bg_colors, owner, owner_image, user_id }) {
        return await storyRepository.create({
            id: 'Story_' + Date.now(),
            image: image || null,
            title: title || null,
            bg_colors: bg_colors || null,
            owner,
            owner_image: owner_image || null,
            user_id: user_id || null,
            active: true,
            created_at: new Date().toISOString(),
        });
    }
}

class CouponService {
    async validateCoupon(code) {
        const coupon = await couponRepository.findOne({ code: code.toUpperCase() });
        if (!coupon) throw new Error('كود الخصم غير صحيح');
        if (!coupon.is_active) throw new Error('كود الخصم غير فعال');

        const now = new Date();
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
            throw new Error('كود الخصم لم يبدأ بعد');
        }
        if (coupon.valid_to && new Date(coupon.valid_to) < now) {
            throw new Error('كود الخصم منتهي الصلاحية');
        }

        return coupon;
    }
}

const AdminService = require('./adminService');

module.exports = {
    authService: new AuthService(),
    menuService: new MenuService(),
    orderService: new OrderService(),
    reviewService: new ReviewService(),
    profileService: new ProfileService(),
    miscService: new MiscService(),
    couponService: new CouponService(),
    adminService: new AdminService(),
    pushService: require('./pushService'),
};
