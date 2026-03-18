// Updated API service to talk to the Fastify backend
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.29:3000/api';

const api = {
    async login(phone, password) {
        console.log('API: Attempting login for:', phone);
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });
        const data = await response.json();
        console.log('API: Login response status:', response.status);
        console.log('API: Login response data:', JSON.stringify(data));
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
        console.log('Fetching stories from:', `${BASE_URL}/stories`);
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

    async validateCoupon(code, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'كود الخصم غير صحيح');
        return data;
    },

    // Admin endpoints
    async getAdminOrders(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/orders`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل طلبات الإدارة');
        return data;
    },

    async getAdminUsers(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/users`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل المستخدمين');
        return data;
    },

    async updateUserStatus(userId, isActive, token) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ isActive }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحديث حالة المستخدم');
        return data;
    },

    async getAdminCategories(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/categories`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل الأقسام للإدارة');
        return data;
    },
    async addCategory(data, token) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(`${BASE_URL}/admin/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const data_ = await response.json();
        if (!response.ok) throw new Error(data_.message || 'فشل إضافة القسم');
        return data_;
    },
    async deleteCategory(id, token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/categories/${id}`, {
            method: 'DELETE',
            headers
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل حذف القسم');
        return data;
    },

    async getAdminCoupons(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/coupons`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل الكوبونات للإدارة');
        return data;
    },
    async addCoupon(data, token) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(`${BASE_URL}/admin/coupons`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const data_ = await response.json();
        if (!response.ok) throw new Error(data_.message || 'فشل إضافة الكوبون');
        return data_;
    },
    async deleteCoupon(id, token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/coupons/${id}`, {
            method: 'DELETE',
            headers
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل حذف الكوبون');
        return data;
    },

    async getAdminDeliveryZones(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/delivery-zones`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل مناطق التوصيل للإدارة');
        return data;
    },
    async addDeliveryZone(data, token) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(`${BASE_URL}/admin/delivery-zones`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const data_ = await response.json();
        if (!response.ok) throw new Error(data_.message || 'فشل إضافة منطقة التوصيل');
        return data_;
    },
    async updateDeliveryZone(id, data, token) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(`${BASE_URL}/admin/delivery-zones/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        const data_ = await response.json();
        if (!response.ok) throw new Error(data_.message || 'فشل تحديث منطقة التوصيل');
        return data_;
    },
    async deleteDeliveryZone(id, token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/delivery-zones/${id}`, {
            method: 'DELETE',
            headers
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل حذف منطقة التوصيل');
        return data;
    },

    async getAdminStats(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/stats`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل الإحصائيات');
        return data;
    },

    async getAdminStories(token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/stories`, { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل تحميل القصص للإدارة');
        return data;
    },

    async addStoryAdmin(storyData, token) {
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };
        const response = await fetch(`${BASE_URL}/admin/stories`, {
            method: 'POST',
            headers,
            body: JSON.stringify(storyData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل إضافة القصة');
        return data;
    },

    async deleteStoryAdmin(storyId, token) {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${BASE_URL}/admin/stories/${storyId}`, {
            method: 'DELETE',
            headers,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'فشل حذف القصة');
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
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
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
