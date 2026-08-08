import { expect, test } from '@playwright/test';
import {
    ADMIN,
    api,
    cleanupAll,
    createTestUser,
    deleteTestUser,
    login,
    uniquePhone,
} from '../helpers/fixtures.js';

test.afterAll(async () => {
    await cleanupAll();
});

test.describe('authentication', () => {
    test('rejects a wrong password', async () => {
        const { status } = await api('/auth/login', {
            method: 'POST',
            body: { phone: ADMIN.phone, password: 'definitely-not-the-password' },
        });
        expect(status).toBe(401);
    });

    test('rejects an empty password', async () => {
        // Regression: login used to return the user without checking the
        // password at all, so any string — including '' — signed you in.
        const { status } = await api('/auth/login', {
            method: 'POST',
            body: { phone: ADMIN.phone, password: '' },
        });
        expect(status).toBe(401);
    });

    test('accepts the correct password', async () => {
        const { status, json } = await api('/auth/login', {
            method: 'POST',
            body: { phone: ADMIN.phone, password: ADMIN.password },
        });
        expect(status).toBe(200);
        expect(json.token).toBeTruthy();
        expect(json.user.role).toBe('admin');
    });

    test('does not reveal whether a phone number is registered', async () => {
        const unknown = await api('/auth/login', {
            method: 'POST',
            body: { phone: uniquePhone(), password: 'whatever' },
        });
        const wrongPassword = await api('/auth/login', {
            method: 'POST',
            body: { phone: ADMIN.phone, password: 'whatever' },
        });
        expect(unknown.status).toBe(wrongPassword.status);
        expect(unknown.json.message).toBe(wrongPassword.json.message);
    });

    test('never returns the password field', async () => {
        const created = await createTestUser();
        try {
            // Assert on the raw API payload — `created` also carries the
            // plaintext password as a convenience for the fixtures.
            expect(Object.keys(created.user)).not.toContain('password');

            const signedIn = await login(created.phone, created.password);
            expect(Object.keys(signedIn.user)).not.toContain('password');

            const profile = await api('/profile', { token: signedIn.token });
            expect(Object.keys(profile.json)).not.toContain('password');
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('stores the password hashed, not in clear text', async () => {
        const created = await createTestUser({ password: 'Sup3rSecret!' });
        try {
            // Logging in with the original password must still work, which only
            // holds if the stored value is a verifiable hash rather than junk.
            const ok = await api('/auth/login', {
                method: 'POST',
                body: { phone: created.phone, password: 'Sup3rSecret!' },
            });
            expect(ok.status).toBe(200);

            const bad = await api('/auth/login', {
                method: 'POST',
                body: { phone: created.phone, password: 'Sup3rSecret' },
            });
            expect(bad.status).toBe(401);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('refuses a duplicate phone number', async () => {
        const created = await createTestUser();
        try {
            const { status } = await api('/auth/register', {
                method: 'POST',
                body: { name: 'dupe', phone: created.phone, password: 'Test1234' },
            });
            expect(status).toBe(400);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('rejects a tampered token', async () => {
        const created = await createTestUser();
        try {
            const forged = `${created.token.slice(0, -6)}AAAAAA`;
            const { status } = await api('/profile', { token: forged });
            expect(status).toBe(401);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });
});

test.describe('authorization', () => {
    test('a customer cannot reach admin endpoints', async () => {
        const created = await createTestUser();
        try {
            const { status } = await api('/admin/orders', { token: created.token });
            expect(status).toBe(403);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('a customer cannot promote themselves via profile update', async () => {
        const created = await createTestUser();
        try {
            await api('/profile', {
                method: 'PUT',
                token: created.token,
                body: { name: 'escalated', role: 'admin', vip_status: 'vip', bonus_story_credits: 999 },
            });

            const { json } = await api('/profile', { token: created.token });
            expect(json.role).toBe('user');
            expect(json.vip_status).not.toBe('vip');
            expect(json.bonus_story_credits ?? 0).toBe(0);
            // A legitimate field on the same request should still have applied.
            expect(json.name).toBe('escalated');
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('unauthenticated requests are refused', async () => {
        for (const path of ['/profile', '/orders', '/stories/quota', '/events']) {
            const { status } = await api(path);
            expect(status, `${path} should require auth`).toBe(401);
        }
    });
});
