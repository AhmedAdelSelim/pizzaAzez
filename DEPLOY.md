# Deploying

**Do step 0 first.** It is not optional and it is not about deployment
convenience — until it is done, the database is readable and deletable by
anyone.

Two pieces, deployed separately:

| Piece | Where | How |
| --- | --- | --- |
| `web/` — Next.js customer + admin site | Vercel | git push |
| `backend/` — Fastify API | your VPS / EC2 | PM2 (`backend/ecosystem.config.js`) |

**Then do step 1 before step 2.** The site is served over HTTPS, and a browser will
refuse to let an HTTPS page talk to an `http://` API — it blocks the request as
mixed content. Deploying the site first just gets you a site where nothing
loads.

---

## 0. Close the database

Production and development share one Supabase project, so this is live data.

1. **Move the API onto the secret key.** Supabase dashboard → Project Settings →
   API → copy the `service_role` key into the server's `backend/.env` as
   `SUPABASE_KEY`. It bypasses Row Level Security; the publishable key does not.
   Never put it in a `NEXT_PUBLIC_*` variable.
2. **Run `backend/migrations/004_enable_rls.sql`.** Order matters — running it
   while the API is still on the publishable key takes the API down. The file
   explains why and includes verification queries.
3. **Rotate `JWT_SECRET`** to `openssl rand -hex 32`. The previous value was the
   published fallback `super-secret-key`, which is enough to forge an admin
   token. This logs everyone out, so pick a quiet moment.
4. **Change the admin account's password.** The old one was committed to a public
   repo as a test default. Update `TEST_ADMIN_PASSWORD` in `web/.env.local`
   afterwards or the suite will stop being able to log in.
5. **Set `TEST_SUPABASE_KEY`** in `web/.env.local` to the service_role key —
   after step 2 the publishable key can no longer delete test rows.

Verify from outside afterwards. This must return `[]`, not data:

```bash
curl "https://<project>.supabase.co/rest/v1/users?select=id&limit=1" \
  -H "apikey: <publishable key>"
```

---

## 1. Give the API a domain and HTTPS

The browser talks to the API **directly**, not through Vercel. That is on
purpose: `web/lib/sseClient.js` holds a long-lived streaming connection open for
live order updates, and routing an indefinite stream through Vercel's proxy
would have it cut. So the API needs its own TLS.

### 1a. Point a subdomain at the server

Add a DNS `A` record:

    api.YOUR-DOMAIN.com   →   <your server's public IP>

Wait for it to resolve (`dig +short api.YOUR-DOMAIN.com`) before continuing —
certificate issuance fails if it does not.

### 1b. Terminate TLS with Caddy

Caddy is the shortest path: it obtains and renews the Let's Encrypt certificate
on its own, with no cron job.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Put this in `/etc/caddy/Caddyfile` (see `backend/Caddyfile.example`):

```
api.YOUR-DOMAIN.com {
    reverse_proxy localhost:3000 {
        # Server-sent events must stream, not be buffered up and delivered at
        # the end — without this the admin order list stops updating live.
        flush_interval -1
    }
}
```

```bash
sudo systemctl reload caddy
curl https://api.YOUR-DOMAIN.com/api/categories   # expect 200 and JSON
```

Leave the API itself on `localhost:3000`; Caddy is the only thing that should be
exposed. Close port 3000 in your firewall / security group.

### 1c. Run the API under PM2

```bash
cd backend
cp .env.example .env      # then fill in real values — see the checklist below
npm ci --omit=dev
pm2 start ecosystem.config.js
pm2 save && pm2 startup   # survive a reboot
```

`.env` must have, at minimum:

- `SUPABASE_URL`
- `SUPABASE_KEY` — the **secret (service_role)** key, not the publishable one.
  See step 0.
- `JWT_SECRET` — `openssl rand -hex 32`
- `ADMIN_PHONE`
- `NODE_ENV=production`

`src/config/index.js` validates these at startup and refuses to boot in
production on a publishable Supabase key, a short `JWT_SECRET`, or a secret that
has previously been published — so a misconfigured deploy fails immediately
instead of running exposed.

---

## 2. Deploy the site to Vercel

1. **New Project → import the GitHub repo.**
2. **Set Root Directory to `web`.** This matters: the repository root is the
   React Native app, and Vercel will build the wrong thing if left at `/`.
   Framework preset should auto-detect as Next.js.
3. Add the environment variables below for **Production**.
4. Deploy.

### Environment variables

Every one is `NEXT_PUBLIC_*`, which means it is **inlined into the JavaScript
bundle at build time, not read at runtime**. Changing any of them requires a
redeploy — editing the value in the Vercel dashboard alone changes nothing.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.YOUR-DOMAIN.com/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable key |
| `NEXT_PUBLIC_ADMIN_PHONE` | same value as `ADMIN_PHONE` in the backend `.env` |

Note the `/api` suffix on the first one — `web/lib/api.js` appends paths
directly to it.

### CORS

Nothing to do. `backend/server.js` registers `@fastify/cors` with
`origin: true`, so it reflects whatever origin calls it, including the
`*.vercel.app` preview domains.

Worth knowing: that also means *any* website can call your API from a browser.
Requests still need a valid JWT, so this is not an open door, but if you would
rather lock it down, replace `origin: true` with an explicit allow-list of your
production and preview domains.

---

## 3. Check it works

Against the deployed site, not localhost:

- Log in. If the network tab shows `Mixed Content` or `ERR_FAILED`, step 1 is
  not finished.
- Place an order as a customer.
- Open `/admin/orders` as the admin **in a second browser** and confirm the new
  order appears **without a refresh** — that is the SSE stream, and it is the
  thing most likely to break behind a misconfigured proxy.
- Confirm an order and check the receipt print dialog opens.

## 4. Optional: silent one-tap printing

On the counter machine, launch Chrome with `--kiosk-printing` and set the
receipt printer as the system default. The confirm-order print dialog then stops
appearing and the ticket prints straight away. No code change.

---

## Not covered here

- **PartyKit** (`pizzaAzez-party/`) deploys separately with `npx partykit deploy`;
  the resulting `wss://` URL goes in the RN app's `EXPO_PUBLIC_PARTYKIT_WS_URL`.
- **The React Native app** ships through EAS, not Vercel.
- **Database migrations** in `backend/migrations/` are run by hand against
  Supabase (SQL Editor or psql). 001–003 are already applied on the shared
  project; `004_enable_rls.sql` is the one outstanding, and it is step 0 above.
