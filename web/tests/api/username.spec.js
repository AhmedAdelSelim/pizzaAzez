import { expect, test } from '@playwright/test';
import {
    api,
    cleanupAll,
    createTestUser,
    deleteTestUser,
    login,
    NAME_PREFIX,
    uniquePhone,
    uniqueUsername,
} from '../helpers/fixtures.js';

const register = (body) => api('/auth/register', { method: 'POST', body });

const validBody = (overrides = {}) => ({
    name: `${NAME_PREFIX}username`,
    username: uniqueUsername(),
    phone: uniquePhone(),
    password: 'Test1234',
    address: 'اختبار',
    ...overrides,
});

test.afterAll(async () => {
    await cleanupAll();
});

test.describe('username at registration', () => {
    test('is stored on the new account', async () => {
        const body = validBody();
        const { status, json } = await register(body);
        try {
            expect(status).toBe(200);
            expect(json.user.username).toBe(body.username);
        } finally {
            await deleteTestUser(json?.user?.id);
        }
    });

    test('is required', async () => {
        const { status, json } = await register(validBody({ username: undefined }));
        expect(status).toBe(400);
        expect(json.message).toContain('اسم المستخدم');
    });

    test('is trimmed before storing', async () => {
        const name = uniqueUsername();
        const { status, json } = await register(validBody({ username: `  ${name}  ` }));
        try {
            expect(status).toBe(200);
            expect(json.user.username).toBe(name);
        } finally {
            await deleteTestUser(json?.user?.id);
        }
    });

    for (const [label, username] of [
        ['too short', 'ab'],
        ['too long', 'a'.repeat(21)],
        ['starting with a digit', '1ahmed'],
        ['containing a space', 'ahmed ali'],
        ['containing Arabic', 'أحمد'],
        ['containing a symbol', 'ahmed!'],
        ['blank', '   '],
    ]) {
        test(`rejects a username ${label}`, async () => {
            const { status } = await register(validBody({ username }));
            expect(status).toBe(400);
        });
    }

    for (const reserved of ['admin', 'Admin', 'support', 'root']) {
        test(`refuses the reserved name "${reserved}"`, async () => {
            const { status, json } = await register(validBody({ username: reserved }));
            expect(status).toBe(400);
            expect(json.message).toContain('غير متاح');
        });
    }

    test('accepts letters, digits, underscore and dot', async () => {
        const username = `ok_${String(Date.now()).slice(-6)}.x`;
        const { status, json } = await register(validBody({ username }));
        try {
            expect(status).toBe(200);
            expect(json.user.username).toBe(username);
        } finally {
            await deleteTestUser(json?.user?.id);
        }
    });
});

test.describe('username uniqueness', () => {
    test('refuses one that is already taken', async () => {
        const first = await createTestUser({ name: 'unique' });
        try {
            const { status, json } = await register(validBody({ username: first.username }));
            expect(status).toBe(400);
            expect(json.message).toContain('مستخدم بالفعل');
        } finally {
            await deleteTestUser(first.user.id);
        }
    });

    test('is case-insensitive', async () => {
        const first = await createTestUser({ name: 'case' });
        try {
            const { status } = await register(
                validBody({ username: first.username.toUpperCase() })
            );
            expect(status).toBe(400);
        } finally {
            await deleteTestUser(first.user.id);
        }
    });
});

test.describe('username is not a credential', () => {
    test('login still works by phone', async () => {
        const created = await createTestUser({ name: 'byphone' });
        try {
            const signedIn = await login(created.phone, created.password);
            expect(signedIn.token).toBeTruthy();
            expect(signedIn.user.username).toBe(created.username);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('login by username is not accepted', async () => {
        const created = await createTestUser({ name: 'notlogin' });
        try {
            const { status } = await api('/auth/login', {
                method: 'POST',
                body: { phone: created.username, password: created.password },
            });
            expect(status).toBe(401);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });

    test('cannot be changed through a profile update', async () => {
        const created = await createTestUser({ name: 'immutable' });
        try {
            await api('/profile', {
                method: 'PUT',
                token: created.token,
                body: { username: 'hijacked' },
            });
            const { json } = await api('/profile', { token: created.token });
            expect(json.username).toBe(created.username);
        } finally {
            await deleteTestUser(created.user.id);
        }
    });
});
