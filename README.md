# RKN Punjabi Soya Chaap

Mobile-first site for **RKN Punjabi Soya Chaap**, a pure-vegetarian counter at Shani Mandir Chauraha, Naini, Prayagraj. Guests browse the menu, switch half and full prices, and send the order to WhatsApp.

The menu and shop settings live in **Cloudflare D1**. The owner signs in at `/admin` to edit them without redeploying.

## Stack

- Vite + React (public site + admin UI)
- Cloudflare Pages Functions (`/api/*`)
- Cloudflare D1 (menu + settings)
- Cookie session auth for a single owner

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local
```

Terminal 1 — Vite (UI on [http://127.0.0.1:4327](http://127.0.0.1:4327)):

```bash
npm run dev
```

Terminal 2 — Pages Functions + local D1 (API on [http://127.0.0.1:8788](http://127.0.0.1:8788), proxies UI):

```bash
npm run build
npm run dev:cf
```

Prefer browsing **http://127.0.0.1:8788** so `/api` and the SPA share one origin (cookies work). Vite alone falls back to the seeded static menu if `/api` is down.

Default super-admin login (from `.dev.vars` / Pages vars):

- Email: `shubhammishrax@gmail.com`
- Password: set via Pages secret `OWNER_PASSWORD` / local `.dev.vars`
- Role: `super_admin`

```bash
npm test
npm run build
```

## Owner admin

- `/admin/login` — email / password
- `/admin` — live orders board (polls every few seconds, optional ring on new orders)
- `/admin/menu` — menu CRUD (add, edit prices, hide items)
- `/admin/settings` — phone, WhatsApp, hours, free-delivery threshold, Zomato/Swiggy URLs
- `/admin/admins` — super admin only: add staff, reset passwords, deactivate accounts

Guest checkout still opens WhatsApp, and also saves the order to D1 so the kitchen board can Accept / Done it.

Admins are stored in D1. Your env `OWNER_EMAIL` / `OWNER_PASSWORD` bootstraps the first super admin on login; after that you can add more from the Admins page.

## Deploy to Cloudflare

Production URLs:

- https://rkn-punjabi-soya-chaap.pages.dev
- https://rkn-punjabi-soya-chaap.services.opuskiln.com (custom domain — requires DNS CNAME)

1. `npx wrangler login`
2. Create D1 and paste the id into [`wrangler.toml`](wrangler.toml):

   ```bash
   npx wrangler d1 create rkn-menu
   ```

3. Apply migrations remotely:

   ```bash
   npm run db:migrate:remote
   ```

4. Set production secrets:

   ```bash
   npx wrangler pages secret put OWNER_PASSWORD
   npx wrangler pages secret put SESSION_SECRET
   ```

   `OWNER_EMAIL` can stay in `wrangler.toml` `[vars]` or also be a secret.

   Optional — live Google reviews (Places API New). Without this, `/api/reviews` serves the cached Google reviews:

   ```bash
   npx wrangler pages secret put GOOGLE_PLACES_API_KEY
   # optional ChIJ… id; otherwise text search is used
   npx wrangler pages secret put GOOGLE_PLACE_ID
   ```

5. Deploy (manual):

   ```bash
   npm run cf:deploy
   ```

   **Deploy on push:** pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (test → build → Cloudflare Pages). GitHub repo secrets required:

   | Secret                  | Value                                                                                                         |
   | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
   | `CLOUDFLARE_ACCOUNT_ID` | `0d7c9361a2629998ff616669f22be334`                                                                            |
   | `CLOUDFLARE_API_TOKEN`  | [API token](https://dash.cloudflare.com/profile/api-tokens) with **Edit Cloudflare Workers** (includes Pages) |

6. Custom domain `rkn-punjabi-soya-chaap.services.opuskiln.com` is attached to the Pages project. At your DNS host (currently Hostinger for `opuskiln.com`), add:

   | Type  | Name                              | Target                             | Proxy               |
   | ----- | --------------------------------- | ---------------------------------- | ------------------- |
   | CNAME | `rkn-punjabi-soya-chaap.services` | `rkn-punjabi-soya-chaap.pages.dev` | off/on as preferred |

   Until that CNAME exists, Cloudflare shows the domain as pending.

## Seed / fallback data

- Menu names and prices (fallback + D1 seed source): [`src/data/menu.ts`](src/data/menu.ts)
- Shop defaults: [`src/data/site.ts`](src/data/site.ts)
- Google reviews cache + `/api/reviews`: [`src/data/reviews.ts`](src/data/reviews.ts)
- English / Hindi UI copy: [`src/data/i18n.ts`](src/data/i18n.ts)

Regenerate the SQL seed after editing those files:

```bash
npm run db:seed:generate
npm run db:migrate:local
```

(If `0002_seed.sql` already applied locally, reset local D1 or add a new migration instead of re-running inserts.)

## Photos

Food photos are self-hosted WebP files (resized). Do not hotlink new images.
