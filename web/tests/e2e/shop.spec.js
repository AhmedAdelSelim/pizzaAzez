import { expect, test } from '@playwright/test';
import { cleanupAll, createTestUser, deleteTestUser } from '../helpers/fixtures.js';

/**
 * The app holds an SSE connection open for the whole session, so Playwright's
 * 'networkidle' never settles. Every navigation in these specs uses
 * 'domcontentloaded' plus an explicit expectation.
 */
const goto = (page, path) => page.goto(path, { waitUntil: 'domcontentloaded' });

let customer;

test.beforeEach(async ({ page }) => {
    customer = await createTestUser({ name: 'shop' });
    await goto(page, '/login');
    await page.getByPlaceholder('رقم الهاتف').fill(customer.phone);
    await page.getByPlaceholder('كلمة المرور').fill(customer.password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(page).toHaveURL('/', { timeout: 20_000 });
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

test('signs in and lands on the storefront', async ({ page }) => {
    await expect(page.getByText('الأقسام')).toBeVisible();
});

test('an unauthenticated visitor is sent to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await goto(page, '/profile');
    await expect(page).toHaveURL(/\/login/);
});

test('browses the menu and opens an item', async ({ page }) => {
    await goto(page, '/menu');
    await expect(page.getByText('مارمريتا').first()).toBeVisible();
    await page.locator('a[href^="/item/"], article').first().click();
    await expect(page).toHaveURL(/\/item\//);
    await expect(page.getByRole('heading', { name: 'اختر الحجم' })).toBeVisible();
});

test('add to cart is blocked until a size is chosen', async ({ page }) => {
    await goto(page, '/item/pz1');
    const add = page.getByRole('button', { name: /أضف للسلة/ });
    await expect(add).toBeDisabled();
    // The bar explains why instead of printing a bare placeholder.
    await expect(page.getByText('اختر الحجم أولاً')).toBeVisible();

    await page.getByText('L', { exact: true }).first().click();
    await expect(add).toBeEnabled();
});

test('completes a checkout end to end', async ({ page }) => {
    await goto(page, '/item/pz1');
    await page.getByText('L', { exact: true }).first().click();
    await page.getByRole('button', { name: /أضف للسلة/ }).click();

    await goto(page, '/cart');
    await expect(page.getByText('مارمريتا').first()).toBeVisible();

    await page.getByRole('button', { name: /إتمام الطلب/ }).click();
    await expect(page).toHaveURL(/\/checkout/);

    // Cash on delivery is the only method offered.
    await expect(page.getByText('الدفع عند الاستلام')).toBeVisible();
    await expect(page.getByText('فودافون كاش')).toHaveCount(0);
    await expect(page.getByText('فوري')).toHaveCount(0);

    await page.getByRole('button', { name: /الجمال/ }).first().click();
    await page.getByRole('button', { name: /تأكيد الطلب/ }).click();

    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 20_000 });
    await expect(page.getByText('تم تأكيد طلبك!')).toBeVisible();
    await expect(page.getByText('عند الاستلام')).toBeVisible();
});

test('a placed order shows as تم الاستلام in history', async ({ page }) => {
    await goto(page, '/item/pz1');
    await page.getByText('L', { exact: true }).first().click();
    await page.getByRole('button', { name: /أضف للسلة/ }).click();
    await goto(page, '/checkout');
    await page.getByRole('button', { name: /الجمال/ }).first().click();
    await page.getByRole('button', { name: /تأكيد الطلب/ }).click();
    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 20_000 });

    await goto(page, '/orders');
    await expect(page.getByText('تم الاستلام').first()).toBeVisible();
    // A brand-new order can still be withdrawn.
    await expect(page.getByRole('button', { name: 'إلغاء' }).first()).toBeVisible();
});

test('checkout redirects away when the cart is empty', async ({ page }) => {
    await goto(page, '/checkout');
    await expect(page).toHaveURL(/\/cart/);
});

test('renders no console or network errors across the main routes', async ({ page }) => {
    const problems = [];
    page.on('pageerror', (e) => problems.push(`JS: ${e.message}`));
    page.on('response', (r) => {
        if (r.status() >= 400 && !r.url().includes('favicon')) {
            problems.push(`${r.status()} ${r.url()}`);
        }
    });

    for (const route of ['/', '/menu', '/offers', '/cart', '/orders', '/profile', '/favorites', '/about']) {
        await goto(page, route);
        await page.waitForTimeout(1200);
    }
    expect(problems).toEqual([]);
});
