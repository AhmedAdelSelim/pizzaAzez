import { expect, test } from '@playwright/test';
import {
    ADMIN,
    cleanupAll,
    createTestUser,
    deleteTestUser,
    placeOrder,
} from '../helpers/fixtures.js';

const goto = (page, path) => page.goto(path, { waitUntil: 'domcontentloaded' });

let customer;

test.beforeEach(async () => {
    customer = await createTestUser({ name: 'rt' });
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

async function signIn(page, phone, password) {
    await goto(page, '/login');
    await page.getByPlaceholder('رقم الهاتف').fill(phone);
    await page.getByPlaceholder('كلمة المرور').fill(password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await page.waitForTimeout(2500);
}

test('a new order appears on the admin dashboard without a reload', async ({ page }) => {
    await signIn(page, ADMIN.phone, ADMIN.password);
    await goto(page, '/admin/orders');
    await expect(page.getByText('إدارة الطلبات')).toBeVisible();
    await page.waitForTimeout(2500);

    const before = await page.locator('article').count();

    // Placed out-of-band, so anything that shows up arrived over the stream.
    const order = await placeOrder(customer.token);

    await expect
        .poll(async () => page.locator('article').count(), { timeout: 15_000 })
        .toBeGreaterThan(before);

    await expect(page.getByText(order.id.substring(0, 8), { exact: false }).first()).toBeVisible();
});

test('the customer sees a status change pushed live', async ({ browser }) => {
    const order = await placeOrder(customer.token);

    const shopper = await browser.newContext();
    const shopperPage = await shopper.newPage();
    await signIn(shopperPage, customer.phone, customer.password);
    await goto(shopperPage, '/orders');
    await expect(shopperPage.getByText('تم الاستلام').first()).toBeVisible();

    const staff = await browser.newContext();
    const staffPage = await staff.newPage();
    await signIn(staffPage, ADMIN.phone, ADMIN.password);

    // Drive the change through the admin API so the test asserts on delivery,
    // not on the admin UI's own widgets.
    await staffPage.evaluate(
        async ([id, api]) => {
            const auth = JSON.parse(localStorage.getItem('@pizzaAzez_auth'));
            await fetch(`${api}/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
                body: JSON.stringify({ status: 'baking' }),
            });
        },
        [order.id, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4555/api']
    );

    await expect(shopperPage.getByText('طلبك الآن في مرحلة: في الفرن')).toBeVisible({
        timeout: 15_000,
    });

    await shopper.close();
    await staff.close();
});

test('a customer cannot open the admin area', async ({ page }) => {
    await signIn(page, customer.phone, customer.password);
    await goto(page, '/admin');
    await expect(page).toHaveURL('/', { timeout: 15_000 });
});

test('an expired session sends the user back to login', async ({ page }) => {
    await signIn(page, customer.phone, customer.password);

    // Break the signature the way a rotated JWT_SECRET would.
    await page.evaluate(() => {
        const key = '@pizzaAzez_auth';
        const stored = JSON.parse(localStorage.getItem(key));
        stored.token = `${stored.token.slice(0, -6)}AAAAAA`;
        localStorage.setItem(key, JSON.stringify(stored));
    });

    await goto(page, '/profile');
    await expect(page).toHaveURL(/\/login\?expired=1/, { timeout: 20_000 });
    // Scoped to the page: Next's dev error overlay echoes the same string.
    await expect(page.getByRole('main').getByText('انتهت جلستك')).toBeVisible();
    // The dead session must not be left behind.
    expect(await page.evaluate(() => localStorage.getItem('@pizzaAzez_auth'))).toBeNull();
});
