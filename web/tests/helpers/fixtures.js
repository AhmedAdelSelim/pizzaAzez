/**
 * Self-cleaning test fixtures.
 *
 * These run against the real backend and the real database, so every row a test
 * creates is tagged and removed again in teardown:
 *
 *   - users  are named with NAME_PREFIX and use phone numbers in TEST_PHONE_RANGE
 *   - orders are deleted by user_id, so they go when their owner does
 *   - stories are deleted by user_id too
 *
 * Nothing here ever touches a row it did not create. `cleanupAll()` filters on
 * the prefix, so a crashed run leaves at most a few tagged rows that the next
 * run sweeps up.
 */

const SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'https://utotcozlqmnverrugjkx.supabase.co';
const SUPABASE_KEY = process.env.TEST_SUPABASE_KEY || 'sb_publishable_HSLL7fsrq4wOZVvxH2lT4Q_XFYKcemz';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4555/api';

/** Everything the suite creates carries this marker. */
export const NAME_PREFIX = '__pwtest__';

/** Reserved block of phone numbers; real customers are 010/011/012 numbers. */
const TEST_PHONE_BASE = '0199';

export const ADMIN = {
    phone: process.env.TEST_ADMIN_PHONE || '01021317616',
    password: process.env.TEST_ADMIN_PASSWORD || '1234567',
};

/** A username that cannot collide with a real customer or a parallel run. */
export function uniqueUsername() {
    usernameCounter += 1;
    return `pwtest${String(Date.now()).slice(-6)}${usernameCounter}`;
}

let usernameCounter = 0;
let phoneCounter = 0;
/** A phone number that cannot collide with a real customer or a parallel run. */
export function uniquePhone() {
    phoneCounter += 1;
    const stamp = String(Date.now()).slice(-5);
    return `${TEST_PHONE_BASE}${stamp}${String(phoneCounter).padStart(2, '0')}`;
}

// ── raw REST helpers (used only for teardown) ────────────────────────────────

async function rest(path, init = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
        ...init,
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    if (!res.ok && res.status !== 404) {
        throw new Error(`Supabase ${init.method || 'GET'} ${path} -> ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// ── API helpers ──────────────────────────────────────────────────────────────

export async function api(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(API_URL + path, {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try {
        json = await res.json();
    } catch {
        /* empty body */
    }
    return { status: res.status, json };
}

export async function login(phone, password) {
    const { status, json } = await api('/auth/login', { method: 'POST', body: { phone, password } });
    if (status !== 200) throw new Error(`login failed for ${phone}: ${json?.message}`);
    return json;
}

export const loginAdmin = () => login(ADMIN.phone, ADMIN.password);

/**
 * Register a throwaway customer.
 *
 * @returns {{user, token, phone, password}}
 */
export async function createTestUser({ name = 'tester', password = 'Test1234' } = {}) {
    const phone = uniquePhone();
    const username = uniqueUsername();
    const { status, json } = await api('/auth/register', {
        method: 'POST',
        body: { name: `${NAME_PREFIX}${name}`, username, phone, password, address: 'اختبار' },
    });
    if (status !== 200) throw new Error(`register failed: ${json?.message}`);
    return { ...json, phone, password, username };
}

/** Grant VIP through the admin API so expiry is set the way production sets it. */
export async function makeVip(userId, adminToken) {
    const { status, json } = await api('/admin/vip-requests/handle', {
        method: 'POST',
        token: adminToken,
        body: { userId, status: 'vip' },
    });
    if (status !== 200) throw new Error(`grant VIP failed: ${json?.message}`);
    return json.user;
}

/** Place an order as the given customer. Returns the created order. */
export async function placeOrder(token, overrides = {}) {
    const { status, json } = await api('/orders', {
        method: 'POST',
        token,
        body: {
            items: [{ id: 'pz1', name: 'مارمريتا', price: 125, quantity: 1 }],
            address: 'الزرقا - اختبار',
            phone: '01990000000',
            total: 140,
            deliveryZone: 'الجمال',
            deliveryFee: 15,
            discount: 0,
            paymentMethod: 'cod',
            ...overrides,
        },
    });
    if (status !== 200) throw new Error(`placeOrder failed: ${json?.message}`);
    return json.order;
}

// ── teardown ─────────────────────────────────────────────────────────────────

/** Delete one test user and everything belonging to them. */
export async function deleteTestUser(userId) {
    if (!userId) return;
    await rest(`/orders?user_id=eq.${userId}`, { method: 'DELETE' });
    await rest(`/stories?user_id=eq.${userId}`, { method: 'DELETE' });
    await rest(`/users?id=eq.${userId}`, { method: 'DELETE' });
}

/**
 * Sweep every row this suite has ever created.
 *
 * Matches on the name prefix only, so rows left behind by a crashed run are
 * collected on the next run and real customers are never touched.
 */
export async function cleanupAll() {
    const stale = (await rest(`/users?select=id&name=like.${NAME_PREFIX}*`)) || [];
    for (const { id } of stale) await deleteTestUser(id);
    return stale.length;
}

/** Open an SSE stream and collect events; returns { events, close }. */
export function openEventStream(token) {
    const events = [];
    const controller = new AbortController();

    const ready = (async () => {
        const res = await fetch(`${API_URL}/events`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
            signal: controller.signal,
        });
        if (!res.ok) throw new Error(`SSE stream rejected: ${res.status}`);

        (async () => {
            const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += value;
                const chunks = buffer.split('\n\n');
                buffer = chunks.pop();
                for (const chunk of chunks) {
                    if (!chunk.trim() || chunk.startsWith(':')) continue; // heartbeat
                    let event = 'message';
                    let data = null;
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('event:')) event = line.slice(6).trim();
                        else if (line.startsWith('data:')) {
                            try {
                                data = JSON.parse(line.slice(5).trim());
                            } catch {
                                /* non-JSON payload */
                            }
                        }
                    }
                    events.push({ event, data });
                }
            }
        })().catch(() => {
            /* aborted */
        });
    })();

    return { events, ready, close: () => controller.abort() };
}

/** Poll until `predicate` passes or the budget runs out. */
export async function waitFor(predicate, { timeout = 8000, interval = 200 } = {}) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const value = await predicate();
        if (value) return value;
        await new Promise((r) => setTimeout(r, interval));
    }
    return null;
}
