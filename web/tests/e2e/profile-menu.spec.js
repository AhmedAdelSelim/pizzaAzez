import { expect, test } from '@playwright/test';
import { cleanupAll, createTestUser, deleteTestUser } from '../helpers/fixtures.js';

/**
 * Every row of the profile menu, checked end to end.
 *
 * Three of these rows were ported from a React Native screen that deliberately
 * left them inert; the port invented destinations for them, and two of those
 * went somewhere the user did not ask for. This pins down where each row leads.
 */
const goto = (page, path) => page.goto(path, { waitUntil: 'domcontentloaded' });

let customer;

test.beforeEach(async ({ page }) => {
    customer = await createTestUser({ name: 'profilemenu' });
    await goto(page, '/login');
    await page.getByPlaceholder('رقم الهاتف').fill(customer.phone);
    await page.getByPlaceholder('كلمة المرور').fill(customer.password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(page).toHaveURL('/', { timeout: 20_000 });
    await goto(page, '/profile');
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

const NAVIGATES = [
    ['تعديل الملف الشخصي', /\/profile\/edit$/, 'تعديل الملف الشخصي'],
    ['سجل الطلبات', /\/orders$/, 'سجل الطلبات'],
    ['المفضلة', /\/favorites$/, 'المفضلة'],
    ['عناوين التوصيل', /\/profile\/edit#address$/, 'تعديل الملف الشخصي'],
    ['المساعدة والدعم', /\/about$/, null],
    ['الاقتراحات والشكاوي', /\/suggestions$/, null],
    ['عن التطبيق', /\/about$/, null],
];

for (const [label, url, heading] of NAVIGATES) {
    test(`"${label}" goes to ${url.source}`, async ({ page }) => {
        await page.getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(url);
        // A route that exists but throws still changes the URL, so confirm the
        // page actually rendered rather than falling into the error boundary.
        await expect(page.getByText('حدث خطأ')).toHaveCount(0);
        if (heading) await expect(page.getByText(heading).first()).toBeVisible();
    });
}

test('"عناوين التوصيل" lands on an address field that is actually there', async ({ page }) => {
    await page.getByRole('link', { name: 'عناوين التوصيل', exact: true }).click();
    await expect(page.locator('#address')).toBeVisible();
    await expect(page.getByPlaceholder('مثال: الزرقا - شارع البحر - عمارة ٧ - الدور الثالث')).toBeVisible();
});

test('"طريقة الدفع" explains cash-only instead of bouncing to the cart', async ({ page }) => {
    await page.getByRole('button', { name: 'طريقة الدفع', exact: true }).click();
    await expect(page.getByText('الدفع عند الاستلام نقداً هو الطريقة الوحيدة المتاحة حالياً.')).toBeVisible();
    await expect(page).toHaveURL(/\/profile$/);
});

test('the saved delivery address round-trips', async ({ page }) => {
    const address = 'الزرقا - شارع البحر - عمارة ٧';
    await goto(page, '/profile/edit');
    await page.locator('#address textarea').fill(address);

    // Wait for the PUT itself: the form navigates back on success, so reloading
    // straight after the click races the request that is meant to persist it.
    const saved = page.waitForResponse(
        (res) => res.url().endsWith('/profile') && res.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
    expect((await saved).status()).toBe(200);

    // The form calls router.back() on success; navigating before that settles
    // cancels it and the goto never resolves.
    await expect(page).toHaveURL(/\/profile$/);

    await goto(page, '/profile/edit');
    await expect(page.locator('#address textarea')).toHaveValue(address);
});
