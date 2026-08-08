# Tests

Playwright drives both layers, so there is one runner and one command.

```bash
npm test              # everything
npm run test:api      # API only — fast, no browser
npm run test:e2e      # browser only (iOS Safari + desktop Chrome)
npm run test:ui       # interactive runner
npm run test:report   # open the last HTML report
```

## What has to be running

| | |
|---|---|
| Backend | `cd ../backend && PORT=4555 node server.js` |
| Web | `npm run dev` (port 3000) — only needed for `test:e2e` |

`NEXT_PUBLIC_API_URL` in `.env.local` points the tests at the API, the same as
the app.

## Layout

```
tests/
  helpers/fixtures.js   seeding + teardown + SSE helper
  api/                  auth, orders, realtime, vip-stories
  e2e/                  shop, admin-realtime, layout
```

Projects in `playwright.config.js`:

- **api** — HTTP against the Fastify backend
- **e2e-mobile** — iPhone 13 / WebKit, the closest thing to a real customer
- **e2e-desktop** — Desktop Chrome

## Test data

These run against the **real** backend and database, so every row a test creates
is tagged and removed afterwards:

- users are named with `__pwtest__` and get phone numbers in the `0199…` block,
  which no real customer uses
- orders and stories are deleted with their owner

`cleanupAll()` runs in `afterAll` and matches on the name prefix only, so a
crashed run leaves at most a few tagged rows that the next run sweeps up. No
test ever touches a row it did not create.

Workers are pinned to 1: fixtures share seeded accounts, and parallel workers
would race each other over them.

## Two things that will bite you

**Never use `waitUntil: 'networkidle'`.** The app holds an SSE connection open
for the whole session, so the network never goes idle and the navigation times
out. Use `'domcontentloaded'` plus an explicit `expect`.

**Scope text locators.** Next's dev error overlay renders error strings into the
DOM, so a bare `getByText` can match both your element and the overlay. Prefer
`getByRole('main').getByText(...)` or a role-based locator.

## Regressions these lock down

Each of these was a real bug:

- login accepted **any** password, including an empty one
- API responses leaked the password field; passwords were stored in clear text
- `PUT /profile` let a customer set their own `role: 'admin'`
- the tab bar covered the cart's checkout button, so checkout looked broken
- orders were created as `preparing`, skipping تم الاستلام
- stories were broadcast but never written to the database
- `#ORD-1234` rendered as `ORD-1234#` in RTL
- the SSE client sent `Cache-Control`, which is not in the server's CORS
  allow-list — Safari blocked the stream, so realtime was dead on iOS
