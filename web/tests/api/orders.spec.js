import { expect, test } from '@playwright/test';
import {
    api,
    cleanupAll,
    createTestUser,
    deleteTestUser,
    loginAdmin,
    placeOrder,
} from '../helpers/fixtures.js';

let admin;
let customer;

test.beforeAll(async () => {
    admin = await loginAdmin();
});

test.beforeEach(async () => {
    customer = await createTestUser({ name: 'orders' });
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

test.describe('order validation', () => {
    // The web form checked these, but the API did not — so anything that was
    // not the web form could create an order the kitchen had no way to deliver.
    const missing = [
        ['no address', { address: undefined }],
        ['a blank address', { address: '   ' }],
        ['no phone', { phone: undefined }],
        ['a blank phone', { phone: '  ' }],
        ['no items', { items: [] }],
    ];

    for (const [label, overrides] of missing) {
        test(`rejects an order with ${label}`, async () => {
            const res = await api('/orders', {
                method: 'POST',
                token: customer.token,
                body: {
                    items: [{ id: 'pz1', name: 'مارجريتا', price: 125, quantity: 1 }],
                    address: 'الزرقا - اختبار',
                    phone: '01990000000',
                    total: 140,
                    ...overrides,
                },
            });
            expect(res.status).toBe(400);
        });
    }

    test('trims the address and phone it stores', async () => {
        const order = await placeOrder(customer.token, {
            address: '  الزرقا - اختبار  ',
            phone: ' 01990000000 ',
        });
        expect(order.address).toBe('الزرقا - اختبار');
        expect(order.phone).toBe('01990000000');
    });
});

test.describe('order lifecycle', () => {
    test('a new order starts at تم الاستلام', async () => {
        const order = await placeOrder(customer.token);
        // 'pending' is the key the tracker maps to تم الاستلام. Orders used to be
        // created as 'preparing', which skipped the first step of the journey.
        expect(order.status).toBe('pending');
    });

    test('only an admin can change the status', async () => {
        const order = await placeOrder(customer.token);

        const asCustomer = await api(`/admin/orders/${order.id}/status`, {
            method: 'PUT',
            token: customer.token,
            body: { status: 'delivered' },
        });
        expect(asCustomer.status).toBe(403);

        const asAdmin = await api(`/admin/orders/${order.id}/status`, {
            method: 'PUT',
            token: admin.token,
            body: { status: 'preparing' },
        });
        expect(asAdmin.status).toBe(200);
        expect(asAdmin.json.status).toBe('preparing');
    });

    test('walks the full status progression', async () => {
        const order = await placeOrder(customer.token);
        for (const status of ['preparing', 'baking', 'shipping', 'delivered']) {
            const res = await api(`/admin/orders/${order.id}/status`, {
                method: 'PUT',
                token: admin.token,
                body: { status },
            });
            expect(res.status, `transition to ${status}`).toBe(200);
            expect(res.json.status).toBe(status);
        }
    });

    test('rejects an unknown status', async () => {
        const order = await placeOrder(customer.token);
        const res = await api(`/admin/orders/${order.id}/status`, {
            method: 'PUT',
            token: admin.token,
            body: { status: 'not-a-real-status' },
        });
        expect(res.status).toBe(400);
    });

    test('will not reopen a finished order', async () => {
        const order = await placeOrder(customer.token);
        await api(`/admin/orders/${order.id}/status`, {
            method: 'PUT',
            token: admin.token,
            body: { status: 'delivered' },
        });

        const reopen = await api(`/admin/orders/${order.id}/status`, {
            method: 'PUT',
            token: admin.token,
            body: { status: 'preparing' },
        });
        expect(reopen.status).toBe(400);
    });
});

test.describe('cancellation', () => {
    test('a customer may cancel before the kitchen starts', async () => {
        const order = await placeOrder(customer.token);
        const res = await api(`/orders/${order.id}/cancel`, { method: 'PUT', token: customer.token });
        expect(res.status).toBe(200);
        expect(res.json.status).toBe('cancelled');
    });

    test('a customer may not cancel once it is in progress', async () => {
        const order = await placeOrder(customer.token);
        await api(`/admin/orders/${order.id}/status`, {
            method: 'PUT',
            token: admin.token,
            body: { status: 'preparing' },
        });

        const res = await api(`/orders/${order.id}/cancel`, { method: 'PUT', token: customer.token });
        expect(res.status).toBe(400);
        expect(res.json.message).toContain('لا يمكن إلغاء الطلب');
    });

    test('a customer cannot cancel somebody else’s order', async () => {
        const order = await placeOrder(customer.token);
        const other = await createTestUser({ name: 'intruder' });
        try {
            const res = await api(`/orders/${order.id}/cancel`, { method: 'PUT', token: other.token });
            expect(res.status).toBe(400);

            // and the order is untouched
            const mine = await api('/orders', { token: customer.token });
            expect(mine.json.find((o) => o.id === order.id).status).toBe('pending');
        } finally {
            await deleteTestUser(other.user.id);
        }
    });
});

test.describe('order visibility', () => {
    test('a customer sees only their own orders', async () => {
        const mine = await placeOrder(customer.token);
        const other = await createTestUser({ name: 'other' });
        try {
            await placeOrder(other.token);

            const list = await api('/orders', { token: customer.token });
            expect(list.status).toBe(200);
            expect(list.json.every((o) => o.user_id === customer.user.id)).toBe(true);
            expect(list.json.some((o) => o.id === mine.id)).toBe(true);
        } finally {
            await deleteTestUser(other.user.id);
        }
    });

    test('the admin list carries the customer name, not just the phone', async () => {
        // The admin card and the printed ticket both need a name to call the
        // customer by; orders themselves only store user_id.
        const order = await placeOrder(customer.token);
        const list = await api('/admin/orders', { token: admin.token });
        const mine = list.json.find((o) => o.id === order.id);
        expect(mine.customer_name).toBe(customer.user.name);
    });

    test('an admin sees the order in the admin list', async () => {
        const order = await placeOrder(customer.token);
        const list = await api('/admin/orders', { token: admin.token });
        expect(list.status).toBe(200);
        expect(list.json.some((o) => o.id === order.id)).toBe(true);
    });
});
