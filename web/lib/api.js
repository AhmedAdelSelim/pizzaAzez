// API service for the Fastify backend — same endpoints/messages as the RN app.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const SESSION_EXPIRED = 'SESSION_EXPIRED';

/**
 * Called when the server rejects a token we actually sent.
 *
 * AuthContext registers itself here at mount; keeping it a plain callback lets
 * this module stay free of React imports.
 */
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, token, fallback = 'حدث خطأ غير متوقع' } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error('تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت');
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        // A 401 on a request that carried a token means the token itself is no
        // longer good — sign the user out rather than leaving them on a screen
        // where nothing loads. Guarding on `token` keeps a failed login (also
        // 401, but unauthenticated) from being mistaken for an expired session.
        if (response.status === 401 && token) {
            const error = new Error('انتهت جلستك، يرجى تسجيل الدخول مرة أخرى');
            error.code = SESSION_EXPIRED;
            onUnauthorized?.();
            throw error;
        }
        throw new Error(data?.message || fallback);
    }
    return data;
}

const api = {
    // ── Auth ──────────────────────────────────────────────────────────────
    login(phone, password) {
        return request('/auth/login', {
            method: 'POST',
            body: { phone, password },
            fallback: 'خطأ في تسجيل الدخول',
        });
    },

    register({ name, username, phone, password, address, email, birthday }) {
        return request('/auth/register', {
            method: 'POST',
            body: { name, username, phone, password, address, email, birthday },
            fallback: 'خطأ في إنشاء الحساب',
        });
    },

    // ── Menu ──────────────────────────────────────────────────────────────
    getCategories() {
        return request('/categories', { fallback: 'فشل تحميل الأقسام' });
    },

    getMenuItems(categoryId = null) {
        const query = categoryId ? `?categoryId=${categoryId}` : '';
        return request(`/menu${query}`, { fallback: 'فشل تحميل القائمة' });
    },

    getMenuItem(itemId) {
        return request(`/menu/${itemId}`, { fallback: 'العنصر غير موجود' });
    },

    async searchMenuItems(query) {
        const data = await request('/menu', { fallback: 'فشل البحث' });
        return data.filter(
            item =>
                (item.name || '').includes(query) ||
                (item.description || '').includes(query)
        );
    },

    getItemReviews(itemId) {
        return request(`/menu/${itemId}/reviews`, { fallback: 'فشل تحميل التقييمات' });
    },

    addItemReview(itemId, rating, comment, token) {
        return request(`/menu/${itemId}/review`, {
            method: 'POST',
            body: { rating, comment },
            token,
            fallback: 'فشل إرسال التقييم',
        });
    },

    // ── Orders ────────────────────────────────────────────────────────────
    placeOrder(orderData, token) {
        return request('/orders', {
            method: 'POST',
            body: orderData,
            token,
            fallback: 'فشل إرسال الطلب',
        });
    },

    getOrders(token) {
        return request('/orders', { token, fallback: 'فشل تحميل الطلبات' });
    },

    cancelOrder(orderId, token) {
        return request(`/orders/${orderId}/cancel`, {
            method: 'PUT',
            token,
            fallback: 'فشل إلغاء الطلب',
        });
    },

    // ── Profile ───────────────────────────────────────────────────────────
    getProfile(token) {
        return request('/profile', { token, fallback: 'فشل تحميل الملف الشخصي' });
    },

    updateProfile(updatedData, token) {
        return request('/profile', {
            method: 'PUT',
            body: updatedData,
            token,
            fallback: 'فشل تحديث الملف الشخصي',
        });
    },

    // ── Misc public content ───────────────────────────────────────────────
    getDeliveryZones() {
        return request('/delivery-zones', { fallback: 'فشل تحميل مناطق التوصيل' });
    },

    getStories() {
        return request('/stories', { fallback: 'فشل تحميل القصص' });
    },

    createStory({ image, title, bg_colors }, token) {
        return request('/stories', {
            method: 'POST',
            body: { image, title, bg_colors },
            token,
            fallback: 'فشل نشر القصة',
        });
    },

    getStoryQuota(token) {
        return request('/stories/quota', { token, fallback: 'فشل تحميل رصيد القصص' });
    },

    getFlashDeals() {
        return request('/flash-deals', { fallback: 'فشل تحميل العروض' });
    },

    validateCoupon(code, token) {
        return request('/coupons/validate', {
            method: 'POST',
            body: { code },
            token,
            fallback: 'كود الخصم غير صحيح',
        });
    },

    submitSuggestion(content, token) {
        return request('/suggestions', {
            method: 'POST',
            body: { content },
            token,
            fallback: 'فشل إرسال الاقتراح',
        });
    },

    requestVip(token) {
        return request('/vip/request', {
            method: 'POST',
            token,
            fallback: 'فشل إرسال طلب VIP',
        });
    },

    // ── Loyalty ───────────────────────────────────────────────────────────
    getLoyaltyPoints(token) {
        return request('/loyalty', { token, fallback: 'فشل تحميل النقاط' });
    },

    redeemLoyaltyPoints(points, token) {
        return request('/loyalty/redeem', {
            method: 'POST',
            body: { points },
            token,
            fallback: 'فشل استرداد النقاط',
        });
    },

    applyReferral(code, token) {
        return request('/loyalty/referral', {
            method: 'POST',
            body: { code },
            token,
            fallback: 'كود الإحالة غير صحيح',
        });
    },

    getReferralStats(token) {
        return request('/loyalty/referral-stats', {
            token,
            fallback: 'فشل تحميل إحصائيات الإحالة',
        });
    },

    checkBirthdayDiscount(token) {
        return request('/loyalty/birthday', {
            token,
            fallback: 'فشل التحقق من خصم عيد الميلاد',
        });
    },

    // ── Admin: orders & stats ─────────────────────────────────────────────
    getAdminOrders(token) {
        return request('/admin/orders', { token, fallback: 'فشل تحميل طلبات الإدارة' });
    },

    updateOrderStatus(orderId, status, token) {
        return request(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: { status },
            token,
            fallback: 'فشل تحديث حالة الطلب',
        });
    },

    getAdminStats(token) {
        return request('/admin/stats', { token, fallback: 'فشل تحميل الإحصائيات' });
    },

    getAdminDailyStats(token) {
        return request('/admin/stats/daily', { token, fallback: 'فشل تحميل إحصائيات الأيام' });
    },

    // ── Admin: users ──────────────────────────────────────────────────────
    getAdminUsers(token) {
        return request('/admin/users', { token, fallback: 'فشل تحميل المستخدمين' });
    },

    updateUserStatus(userId, isActive, token) {
        return request(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: { isActive },
            token,
            fallback: 'فشل تحديث حالة المستخدم',
        });
    },

    grantStoryCredits(userId, credits, token) {
        return request(`/admin/users/${userId}/story-credits`, {
            method: 'POST',
            body: { credits },
            token,
            fallback: 'فشل منح القصص الإضافية',
        });
    },

    getAdminVipRequests(token) {
        return request('/admin/vip-requests', { token, fallback: 'فشل تحميل طلبات VIP' });
    },

    handleVipRequest(userId, status, token) {
        return request('/admin/vip-requests/handle', {
            method: 'POST',
            body: { userId, status },
            token,
            fallback: 'فشل معالجة الطلب',
        });
    },

    // ── Admin: menu ───────────────────────────────────────────────────────
    addMenuItem(itemData, token) {
        return request('/admin/menu', {
            method: 'POST',
            body: itemData,
            token,
            fallback: 'فشل إضافة العنصر',
        });
    },

    updateMenuItemAdmin(itemId, itemData, token) {
        return request(`/admin/menu/${itemId}`, {
            method: 'PUT',
            body: itemData,
            token,
            fallback: 'فشل تحديث العنصر',
        });
    },

    deleteMenuItemAdmin(itemId, token) {
        return request(`/admin/menu/${itemId}`, {
            method: 'DELETE',
            token,
            fallback: 'فشل حذف العنصر',
        });
    },

    toggleMenuItemAvailability(itemId, is_available, token) {
        return request(`/admin/menu/${itemId}/availability`, {
            method: 'PUT',
            body: { is_available },
            token,
            fallback: 'فشل تحديث حالة الصنف',
        });
    },

    // ── Admin: categories ─────────────────────────────────────────────────
    getAdminCategories(token) {
        return request('/admin/categories', { token, fallback: 'فشل تحميل الأقسام للإدارة' });
    },

    addCategory(data, token) {
        return request('/admin/categories', {
            method: 'POST',
            body: data,
            token,
            fallback: 'فشل إضافة القسم',
        });
    },

    deleteCategory(id, token) {
        return request(`/admin/categories/${id}`, {
            method: 'DELETE',
            token,
            fallback: 'فشل حذف القسم',
        });
    },

    // ── Admin: coupons ────────────────────────────────────────────────────
    getAdminCoupons(token) {
        return request('/admin/coupons', { token, fallback: 'فشل تحميل الكوبونات للإدارة' });
    },

    addCoupon(data, token) {
        return request('/admin/coupons', {
            method: 'POST',
            body: data,
            token,
            fallback: 'فشل إضافة الكوبون',
        });
    },

    deleteCoupon(id, token) {
        return request(`/admin/coupons/${id}`, {
            method: 'DELETE',
            token,
            fallback: 'فشل حذف الكوبون',
        });
    },

    // ── Admin: delivery zones ─────────────────────────────────────────────
    getAdminDeliveryZones(token) {
        return request('/admin/delivery-zones', {
            token,
            fallback: 'فشل تحميل مناطق التوصيل للإدارة',
        });
    },

    addDeliveryZone(data, token) {
        return request('/admin/delivery-zones', {
            method: 'POST',
            body: data,
            token,
            fallback: 'فشل إضافة منطقة التوصيل',
        });
    },

    updateDeliveryZone(id, data, token) {
        return request(`/admin/delivery-zones/${id}`, {
            method: 'PUT',
            body: data,
            token,
            fallback: 'فشل تحديث منطقة التوصيل',
        });
    },

    deleteDeliveryZone(id, token) {
        return request(`/admin/delivery-zones/${id}`, {
            method: 'DELETE',
            token,
            fallback: 'فشل حذف منطقة التوصيل',
        });
    },

    // ── Admin: stories ────────────────────────────────────────────────────
    getAdminStories(token) {
        return request('/admin/stories', { token, fallback: 'فشل تحميل القصص للإدارة' });
    },

    addStoryAdmin(storyData, token) {
        return request('/admin/stories', {
            method: 'POST',
            body: storyData,
            token,
            fallback: 'فشل إضافة القصة',
        });
    },

    deleteStoryAdmin(storyId, token) {
        return request(`/admin/stories/${storyId}`, {
            method: 'DELETE',
            token,
            fallback: 'فشل حذف القصة',
        });
    },

    // ── Admin: suggestions, flash deals, broadcast ────────────────────────
    getAdminSuggestions(token) {
        return request('/admin/suggestions', { token, fallback: 'فشل تحميل الاقتراحات' });
    },

    getAdminFlashDeals(token) {
        return request('/admin/flash-deals', { token, fallback: 'فشل تحميل العروض' });
    },

    createFlashDeal(dealData, token) {
        return request('/admin/flash-deals', {
            method: 'POST',
            body: dealData,
            token,
            fallback: 'فشل إنشاء العرض',
        });
    },

    deleteFlashDeal(id, token) {
        return request(`/admin/flash-deals/${id}`, {
            method: 'DELETE',
            token,
            fallback: 'فشل حذف العرض',
        });
    },

    broadcastNotification(title, body, token) {
        return request('/admin/broadcast', {
            method: 'POST',
            body: { title, body },
            token,
            fallback: 'فشل إرسال الإشعار',
        });
    },
};

export default api;
