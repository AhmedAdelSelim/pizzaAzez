import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Playwright does not read .env files on its own, and the fixtures now take
// their Supabase key and admin credentials from the environment with no inline
// defaults. Without this the suite fails at import with a message telling you
// which variable is missing.
loadEnv({ path: '.env.local', quiet: true });

const WEB_URL = process.env.TEST_WEB_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4555/api';

export default defineConfig({
    testDir: './tests',
    // Compiles every route before the first test. `next dev` builds routes on
    // demand, and a compile landing mid-test produced a rotating set of failures
    // that never reproduced in isolation. See tests/global-setup.js.
    globalSetup: './tests/global-setup.js',
    // Fixtures create and delete real rows, so parallel workers would race each
    // other over the same seeded accounts. One worker keeps runs deterministic.
    workers: 1,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    timeout: 60_000,
    expect: { timeout: 15_000 },

    use: {
        baseURL: WEB_URL,
        // The app keeps an SSE connection open for the whole session, so
        // 'networkidle' never fires. Every navigation must use this instead.
        navigationTimeout: 30_000,
        actionTimeout: 15_000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'api',
            testMatch: /api\/.*\.spec\.js/,
            use: { baseURL: API_URL },
        },
        {
            name: 'e2e-mobile',
            testMatch: /e2e\/.*\.spec\.js/,
            use: { ...devices['iPhone 13'] },
        },
        {
            name: 'e2e-desktop',
            testMatch: /e2e\/.*\.spec\.js/,
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
