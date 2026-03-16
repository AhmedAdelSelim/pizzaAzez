const {
    userRepository,
    categoryRepository,
    menuItemRepository,
    orderRepository,
    deliveryZoneRepository,
    storyRepository,
    couponRepository
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
        return await menuItemRepository.find(filter);
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

    async getOrders() {
        return await orderRepository.find({});
    }
}

class ProfileService {
    async getProfile() {
        // Simple demo: return the first user
        return await userRepository.findOne({});
    }

    async updateProfile(updates) {
        const user = await userRepository.findOne({});
        if (!user) throw new Error('User not found');
        return await userRepository.update({ id: user.id }, updates);
    }
}

class MiscService {
    async getDeliveryZones() {
        return await deliveryZoneRepository.find({});
    }

    async getStories() {
        return await storyRepository.find({});
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
    profileService: new ProfileService(),
    miscService: new MiscService(),
    couponService: new CouponService(),
    adminService: new AdminService(),
    pushService: require('./pushService'),
};
