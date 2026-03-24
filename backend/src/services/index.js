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

class AuthService {
    async login(phone, password) {
        const user = await userRepository.findOne({ phone });
        if (!user) throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة');
        if (user.is_active === false) throw new Error('تم تعطيل حسابك. يرجى مراجعة الإدارة.');
        
        // In a real app, verify password with bcrypt
        if (phone === '01021317616') {
            user.role = 'admin';
            // Now that we have the column, let's persist it
            await userRepository.update({ id: user.id }, { role: 'admin' });
        }
        return user;
    }

    async register(userData) {
        const existing = await userRepository.findOne({ phone: userData.phone });
        if (existing) throw new Error('رقم الهاتف مسجل بالفعل');
        userData.id = 'user_' + Date.now();
        
        // Save to DB first without role to avoid crash if column missing
        const savedUser = await userRepository.create(userData);
        
        if (savedUser.phone === '01021317616') {
            savedUser.role = 'admin';
        }
        return savedUser;
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
        orderData.id = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        orderData.date = new Date().toISOString().split('T')[0];
        orderData.status = 'preparing';
        // Map camelCase fields to snake_case for the DB
        const dbData = {
            id: orderData.id,
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
        const result = await orderRepository.create(dbData);

        // Notify Admins
        this.notifyAdmins(result).catch(err => console.error('Notification error:', err));

        return result;
    }

    async notifyAdmins(order) {
        try {
            const admins = await userRepository.find({ role: 'admin' });
            const tokens = admins.map(admin => admin.push_token).filter(token => !!token);
            
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
        if (!['pending', 'preparing'].includes(order.status)) {
            throw new Error('لا يمكن إلغاء هذا الطلب بعد أن بدأ التحضير');
        }
        return await orderRepository.update({ id: orderId }, { status: 'cancelled' });
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
        return await userRepository.findOne({ id: userId });
    }

    async updateProfile(userId, updates) {
        return await userRepository.update({ id: userId }, updates);
    }
}

class MiscService {
    async getDeliveryZones() {
        return await deliveryZoneRepository.find({});
    }

    async getStories() {
        return await storyRepository.find({});
    }

    async createStory({ image, title, bg_colors, owner, owner_image }) {
        return await storyRepository.create({
            id: 'Story_' + Date.now(),
            image: image || null,
            title: title || null,
            bg_colors: bg_colors || null,
            owner,
            owner_image: owner_image || null,
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
