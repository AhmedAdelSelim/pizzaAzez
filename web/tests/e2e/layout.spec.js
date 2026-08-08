import { expect, test } from '@playwright/test';
import { cleanupAll, createTestUser, deleteTestUser } from '../helpers/fixtures.js';

const goto = (page, path) => page.goto(path, { waitUntil: 'domcontentloaded' });

let customer;

test.beforeEach(async ({ page }) => {
    customer = await createTestUser({ name: 'layout' });
    await goto(page, '/login');
    await page.getByPlaceholder('رقم الهاتف').fill(customer.phone);
    await page.getByPlaceholder('كلمة المرور').fill(customer.password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await page.waitForTimeout(2500);
});

test.afterEach(async () => {
    await deleteTestUser(customer?.user?.id);
});

test.afterAll(async () => {
    await cleanupAll();
});

const CUSTOMER_ROUTES = [
    '/', '/menu', '/offers', '/cart', '/orders',
    '/profile', '/favorites', '/suggestions', '/about', '/item/pz1',
];

test('no route overflows horizontally', async ({ page }) => {
    const overflowing = [];
    for (const route of CUSTOMER_ROUTES) {
        await goto(page, route);
        await page.waitForTimeout(900);
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        if (overflow > 1) overflowing.push(`${route} (+${overflow}px)`);
    }
    expect(overflowing).toEqual([]);
});

test('the bottom tabs are present on every customer route', async ({ page }) => {
    const missing = [];
    for (const route of CUSTOMER_ROUTES) {
        await goto(page, route);
        await page.waitForTimeout(700);
        if (!(await page.locator('nav.fixed.bottom-0').first().isVisible())) missing.push(route);
    }
    expect(missing).toEqual([]);
});

test('a bottom CTA is never hidden behind the tab bar', async ({ page }) => {
    // Regression: the tab bar sat on top of the cart's checkout button, so the
    // click landed on the nav and checkout appeared broken.
    await goto(page, '/item/pz1');
    await page.getByText('L', { exact: true }).first().click();
    await page.getByRole('button', { name: /أضف للسلة/ }).click();

    for (const [route, name] of [['/item/pz1', /أضف للسلة/], ['/cart', /إتمام الطلب/]]) {
        await goto(page, route);
        await page.waitForTimeout(1200);
        if (route.startsWith('/item')) {
            await page.getByText('L', { exact: true }).first().click();
        }
        const cta = page.getByRole('button', { name }).first();
        const ctaBox = await cta.boundingBox();
        const navBox = await page.locator('nav.fixed.bottom-0').first().boundingBox();
        expect(ctaBox.y + ctaBox.height, `${route} CTA overlaps the tab bar`).toBeLessThanOrEqual(
            navBox.y + 1
        );
    }
});

test('no input is small enough to trigger iOS zoom-on-focus', async ({ page }) => {
    const offenders = [];
    for (const route of ['/menu', '/cart', '/suggestions', '/profile/edit']) {
        await goto(page, route);
        await page.waitForTimeout(900);
        const small = await page.evaluate(() =>
            [...document.querySelectorAll('input, select, textarea')]
                .map((el) => ({ type: el.type || el.tagName, size: parseFloat(getComputedStyle(el).fontSize) }))
                .filter((f) => f.size < 16)
        );
        small.forEach((f) => offenders.push(`${route}: ${f.type} @ ${f.size}px`));
    }
    expect(offenders).toEqual([]);
});

test('embedded LTR runs keep their punctuation in place', async ({ page }) => {
    // Regression: '#ORD-J25T' rendered as 'ORD-J25T#' because the neutral '#'
    // resolved against the surrounding RTL paragraph.
    await goto(page, '/item/pz1');
    await page.getByText('L', { exact: true }).first().click();
    await page.getByRole('button', { name: /أضف للسلة/ }).click();
    await goto(page, '/checkout');
    await page.getByRole('button', { name: /الجمال/ }).first().click();
    await page.getByRole('button', { name: /تأكيد الطلب/ }).click();
    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 20_000 });

    await goto(page, '/orders');
    const id = page.locator('bdi').first();
    await expect(id).toBeVisible();
    await expect(id).toHaveText(/^#/); // the hash leads, and is isolated in a <bdi>
    await expect(id).toHaveAttribute('dir', 'ltr');
});

test('the document is right-to-left', async ({ page }) => {
    await goto(page, '/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
});
