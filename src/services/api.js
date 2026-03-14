// Updated API service to talk to the Fastify backend
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.29:3000/api';

const api = {
    async login(phone, password) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'خطأ في تسجيل الدخول');
        return data;
    },

    async register({ name, phone, password, address, email }) {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, password, address, email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'خطأ في إنشاء الحساب');
        return data;
    },

    async getCategories() {
        const response = await fetch(`${BASE_URL}/categories`);
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحميل الأقسام');
        return data;
    },

    async getMenuItems(categoryId = null) {
        let url = `${BASE_URL}/menu`;
        if (categoryId) url += `?categoryId=${categoryId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحميل القائمة');
        return data;
    },

    async getMenuItem(itemId) {
        const response = await fetch(`${BASE_URL}/menu/${itemId}`);
        const data = await response.json();
        if (!response.ok) throw new Error('العنصر غير موجود');
        return data;
    },

    async searchMenuItems(query) {
        const response = await fetch(`${BASE_URL}/menu`);
        const data = await response.json();
        if (!response.ok) throw new Error('فشل البحث');
        return data.filter(
            item =>
                (item.name || '').includes(query) ||
                (item.description || '').includes(query)
        );
    },

    async placeOrder(orderData, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify(orderData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error('فشل إرسال الطلب');
        return data;
    },

    async getProfile(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}/profile`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحميل الملف الشخصي');
        return data;
    },

    async getDeliveryZones() {
        const response = await fetch(`${BASE_URL}/delivery-zones`);
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحميل مناطق التوصيل');
        return data;
    },

    async updateProfile(updatedData, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updatedData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحديث الملف الشخصي');
        return data;
    },

    async getStories() {
        const response = await fetch(`${BASE_URL}/stories`);
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحميل القصص');
        return data;
    },

    async getOrders(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/orders`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error('فشل تحميل الطلبات');
        return data;
    },

    async validateCoupon(code) {
        const response = await fetch(`${BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'كود الخصم غير صحيح');
        return data;
    },

    // Admin endpoints
    async getAdminOrders(token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${BASE_URL}/admin/orders`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل طلبات الإدارة');
        return data;
    },

    async updateOrderStatus(orderId, status, token) {
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };
        const response = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحديث حالة الطلب');
        return data;
    },

    async addMenuItem(itemData, token) {
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };
        const response = await fetch(`${BASE_URL}/admin/menu`, {
            method: 'POST',
            headers,
            body: JSON.stringify(itemData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل إضافة العنصر');
        return data;
    },

    async updateMenuItemAdmin(itemId, itemData, token) {
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };
        const response = await fetch(`${BASE_URL}/admin/menu/${itemId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(itemData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحديث العنصر');
        return data;
    },

    async deleteMenuItemAdmin(itemId, token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${BASE_URL}/admin/menu/${itemId}`, {
            method: 'DELETE',
            headers,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل حذف العنصر');
        return data;
    }
};

export default api;
