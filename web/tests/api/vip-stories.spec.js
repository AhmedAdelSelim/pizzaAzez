import { expect, test } from '@playwright/test';
import {
    api,
    cleanupAll,
    createTestUser,
    deleteTestUser,
    loginAdmin,
    login,
    makeVip,
} from '../helpers/fixtures.js';

let admin;
let customer;

test.beforeAll(async () => {
    admin = await loginAdmin();
});

test.beforeEach(async () => {
    customer = await createTestUser({ name: 'vip' });
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

const postStory = (token, title) =>
    api('/stories', { method: 'POST', token, body: { title } });

test.describe('story permissions', () => {
    test('a non-VIP customer cannot post', async () => {
        const res = await postStory(customer.token, 'nope');
        expect(res.status).toBe(403);
    });

    test('a VIP can post and the story is persisted', async () => {
        await makeVip(customer.user.id, admin.token);
        const fresh = await login(customer.phone, customer.password);

        const res = await postStory(fresh.token, '__pwtest__ story');
        expect(res.status).toBe(200);
        expect(res.json.id).toBeTruthy();

        // Regression: createStory used to broadcast without ever writing to the
        // database, so stories vanished on refresh.
        const listed = await api('/stories');
        expect(listed.json.some((s) => s.id === res.json.id)).toBe(true);
    });
});

test.describe('monthly story quota', () => {
    test('a fresh VIP gets the full allowance', async () => {
        await makeVip(customer.user.id, admin.token);
        const fresh = await login(customer.phone, customer.password);

        const { json } = await api('/stories/quota', { token: fresh.token });
        expect(json.limit).toBe(10);
        expect(json.used).toBe(0);
        expect(json.remaining).toBe(10);
        expect(json.vipActive).toBe(true);
    });

    test('the allowance runs out after 10 stories and points at the admin', async () => {
        await makeVip(customer.user.id, admin.token);
        const fresh = await login(customer.phone, customer.password);

        for (let i = 1; i <= 10; i += 1) {
            const res = await postStory(fresh.token, `__pwtest__ ${i}`);
            expect(res.status, `story ${i} should be allowed`).toBe(200);
        }

        const quota = await api('/stories/quota', { token: fresh.token });
        expect(quota.json.remaining).toBe(0);

        const eleventh = await postStory(fresh.token, '__pwtest__ 11');
        expect(eleventh.status).toBe(403);
        expect(eleventh.json.code).toBe('STORY_QUOTA_EXCEEDED');
        expect(eleventh.json.message).toContain('التواصل مع الإدارة');
    });

    test('admin-granted credits restore posting', async () => {
        await makeVip(customer.user.id, admin.token);
        const fresh = await login(customer.phone, customer.password);
        for (let i = 0; i < 10; i += 1) await postStory(fresh.token, `__pwtest__ ${i}`);

        const grant = await api(`/admin/users/${customer.user.id}/story-credits`, {
            method: 'POST',
            token: admin.token,
            body: { credits: 5 },
        });
        expect(grant.status).toBe(200);
        expect(grant.json.quota.remaining).toBe(5);

        const afterGrant = await postStory(fresh.token, '__pwtest__ bonus');
        expect(afterGrant.status).toBe(200);

        // The monthly allowance is spent first, so this comes out of the bonus.
        const quota = await api('/stories/quota', { token: fresh.token });
        expect(quota.json.used).toBe(10);
        expect(quota.json.bonus).toBe(4);
    });

    test('only an admin may grant credits', async () => {
        const res = await api(`/admin/users/${customer.user.id}/story-credits`, {
            method: 'POST',
            token: customer.token,
            body: { credits: 100 },
        });
        expect(res.status).toBe(403);
    });

    test('rejects a nonsense credit amount', async () => {
        for (const credits of [0, -5, 'many']) {
            const res = await api(`/admin/users/${customer.user.id}/story-credits`, {
                method: 'POST',
                token: admin.token,
                body: { credits },
            });
            expect(res.status, `credits=${credits} should be rejected`).toBe(400);
        }
    });

    test('an admin posts without any limit', async () => {
        const { json } = await api('/stories/quota', { token: admin.token });
        expect(json.unlimited).toBe(true);
    });
});
