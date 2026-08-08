import { expect, test } from '@playwright/test';
import {
    api,
    cleanupAll,
    createTestUser,
    deleteTestUser,
    loginAdmin,
    openEventStream,
    placeOrder,
    waitFor,
} from '../helpers/fixtures.js';

let admin;
let customer;

test.beforeAll(async () => {
    admin = await loginAdmin();
});

test.beforeEach(async () => {
    customer = await createTestUser({ name: 'sse' });
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

test.describe('server-sent events', () => {
    test('the stream requires a valid token', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4555/api'}/events`,
            { headers: { Authorization: 'Bearer not-a-real-token' } }
        );
        expect(res.status).toBe(401);
        // Consume the body so the socket closes cleanly.
        await res.text();
    });

    test('greets a new subscriber with a connected event', async () => {
        const stream = openEventStream(customer.token);
        try {
            await stream.ready;
            const hello = await waitFor(() => stream.events.find((e) => e.event === 'connected'));
            expect(hello).toBeTruthy();
        } finally {
            stream.close();
        }
    });

    test('an admin is told about a new order', async () => {
        const adminStream = openEventStream(admin.token);
        try {
            await adminStream.ready;
            adminStream.events.length = 0;

            const order = await placeOrder(customer.token);

            const event = await waitFor(() =>
                adminStream.events.find((e) => e.event === 'new_order' && e.data?.id === order.id)
            );
            expect(event, 'admin should receive new_order').toBeTruthy();
            // The payload carries the whole order so the dashboard can prepend
            // it without a refetch.
            expect(event.data.total).toBeDefined();
        } finally {
            adminStream.close();
        }
    });

    test('the customer is told when the admin advances their order', async () => {
        const customerStream = openEventStream(customer.token);
        try {
            await customerStream.ready;
            const order = await placeOrder(customer.token);
            customerStream.events.length = 0;

            await api(`/admin/orders/${order.id}/status`, {
                method: 'PUT',
                token: admin.token,
                body: { status: 'baking' },
            });

            const event = await waitFor(() =>
                customerStream.events.find((e) => e.event === 'order_status')
            );
            expect(event, 'customer should receive order_status').toBeTruthy();
            expect(event.data.orderId).toBe(order.id);
            expect(event.data.status).toBe('baking');
        } finally {
            customerStream.close();
        }
    });

    test('other admins are told when an order changes', async () => {
        const adminStream = openEventStream(admin.token);
        try {
            await adminStream.ready;
            const order = await placeOrder(customer.token);
            adminStream.events.length = 0;

            await api(`/admin/orders/${order.id}/status`, {
                method: 'PUT',
                token: admin.token,
                body: { status: 'preparing' },
            });

            const event = await waitFor(() =>
                adminStream.events.find((e) => e.event === 'order_updated')
            );
            expect(event).toBeTruthy();
            expect(event.data.status).toBe('preparing');
        } finally {
            adminStream.close();
        }
    });

    test('a customer never receives another customer’s order events', async () => {
        const eavesdropper = await createTestUser({ name: 'eavesdrop' });
        const stream = openEventStream(eavesdropper.token);
        try {
            await stream.ready;
            const order = await placeOrder(customer.token);
            stream.events.length = 0;

            await api(`/admin/orders/${order.id}/status`, {
                method: 'PUT',
                token: admin.token,
                body: { status: 'preparing' },
            });

            // Give the stream a fair chance to (wrongly) deliver something.
            await new Promise((r) => setTimeout(r, 2500));
            const leaked = stream.events.filter((e) =>
                ['order_status', 'order_updated', 'new_order'].includes(e.event)
            );
            expect(leaked, 'unrelated customer must not see order events').toEqual([]);
        } finally {
            stream.close();
            await deleteTestUser(eavesdropper.user.id);
        }
    });
});
