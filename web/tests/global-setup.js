/**
 * Compile every route before the suite starts.
 *
 * `next dev` compiles a route the first time it is requested. When that happens
 * *during* a test, the page can be served while chunks are still being built —
 * which showed up as a rotating cast of failures that never reproduced in
 * isolation: ChunkLoadError on the hot-reload client, a missing bottom tab bar,
 * a navigation that arrived late. Different test each run, same cause.
 *
 * Requesting each route once up front moves that compile cost outside the tests.
 * It is not a workaround for a product bug — nothing here compiles on demand in
 * production, which is why none of it was ever reachable by a real user.
 */

const ROUTES = [
    '/',
    '/login',
    '/register',
    '/menu',
    '/offers',
    '/cart',
    '/checkout',
    '/orders',
    '/profile',
    '/profile/edit',
    '/favorites',
    '/about',
    '/suggestions',
    '/stories/create',
    '/admin',
    '/admin/orders',
    '/admin/menu',
    '/admin/users',
    '/admin/stories',
    '/admin/suggestions',
    '/admin/vip-requests',
    '/admin/coupons',
    '/admin/categories',
    '/admin/delivery-zones',
    '/admin/stats',
    '/admin/active-users',
];

export default async function globalSetup() {
    const base = process.env.TEST_WEB_URL || 'http://localhost:3000';

    // A production build (`next start`) serves these instantly, so this costs
    // nothing there — it only earns its keep against `next dev`.
    const started = Date.now();
    const results = await Promise.allSettled(
        ROUTES.map((route) =>
            fetch(base + route, { headers: { 'user-agent': 'playwright-warmup' } })
        )
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    const elapsed = Math.round((Date.now() - started) / 1000);

    if (failed === ROUTES.length) {
        // Every route unreachable means the dev server is not up. Say so plainly
        // rather than letting 56 tests fail one by one on navigation timeouts.
        throw new Error(
            `Warm-up could not reach any route at ${base}.\n` +
            `  Start the web app first: npm run dev\n` +
            `  (and the API: cd ../backend && PORT=4555 node server.js)`
        );
    }

    console.log(
        `[warmup] compiled ${ROUTES.length - failed}/${ROUTES.length} routes in ${elapsed}s`
    );
}
