# MarketLink customer API contract

The customer app (`customers interface/`) is backend-ready. Set these in
`customers interface/assets/js/config.js` and it talks to your server instead of
localStorage:

```js
MODE: 'api',
API_BASE: 'https://api.example.com/v1'
```

All calls go through `assets/js/api.js` (`ML.api`). Nothing else in the UI needs to change.

## Conventions

- JSON in, JSON out. Times are ISO 8601 UTC. Money is an integer number of naira (`₦4,800` is `4800`).
- Auth: `Authorization: Bearer <token>` (returned by login/register) and/or a secure cookie session (`CREDENTIALS: 'include'`, enable CORS with credentials).
- `POST /orders` sends an `Idempotency-Key` header. Return the same order if the key repeats.
- Errors use one shape, with a matching HTTP status (400 validation, 401 unauthenticated, 403, 404, 409 conflict, 422, 429, 5xx):

```json
{ "error": { "code": "validation_failed", "message": "Enter a valid email.", "fields": { "email": "Enter a valid email." } } }
```

A `401` clears the local session. `409 stock_changed` on order create makes the UI refresh the basket.

**The server must own prices, stock, promo discounts, harvest-lock times and order codes.** The client sends ids and quantities only and displays what the server returns.

## Endpoints

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/catalog` | Bootstrap data | `{ categories, farms, hubs, products, promos }` (shapes below). Public. |
| POST | `/auth/register` | Create account | `{ name, email, password, area, acceptTerms }` → `{ token, user }` |
| POST | `/auth/login` | Sign in | `{ email, password, remember }` → `{ token, user }` |
| POST | `/auth/logout` | Sign out | 204 |
| POST | `/auth/forgot-password` | Send reset email | `{ email }` → `{ sent: true }` (always 200, never reveal if the email exists) |
| GET | `/me/bootstrap` | Session restore | `{ user, orders, notifications, favorites: { products, farms }, preferences }` |
| PATCH | `/me` | Update profile | `{ name?, phone?, area?, avatar? }` → `user` |
| POST | `/me/avatar` | Upload photo | multipart field `avatar` → `{ avatarUrl }` |
| PUT | `/me/preferences` | Save preferences | see Preferences |
| PUT | `/me/favorites` | Save favourites | `{ products: [id], farms: [id] }` |
| POST | `/promos/validate` | Check a promo | `{ code, subtotal }` → `{ valid, code, label, discount }` |
| POST | `/orders` | Place order | body below → `order` (201) |
| GET | `/orders` | List my orders | → `[order]` |
| GET | `/orders/:id` | One order | |
| POST | `/orders/:id/cancel` | Cancel | Only while `status = reserved` and before the harvest lock, else 409 `cannot_cancel` |
| POST | `/orders/:id/review` | Rate a collected order | `{ stars: 1-5, text }` → `order` (`reviewed: true`) |
| POST | `/products/:id/reviews` | Review a product | `{ name, stars, text }` → review |
| GET | `/notifications` | Inbox | |
| PATCH | `/notifications/:id` | Mark read/unread | `{ read: boolean }` |
| POST | `/notifications/read-all` | Mark all read | |
| DELETE | `/notifications/:id` | Delete one | |
| DELETE | `/notifications` | Clear all | |
| POST | `/client-errors` | Optional error log | when `ERROR_REPORTING: true` |

Farmers-side endpoints (products, pickup slots, order status changes such as
`reserved → harvesting → packed → ready → collected`) are outside this contract, but
each status change should create a notification for the customer.

### `POST /orders` body

```json
{
  "items": [{ "productId": "ugu-bundle", "quantity": 2 }],
  "hubId": "yaba",
  "pickupDate": "2026-10-03",
  "promoCode": "FRESH10",
  "paymentMethod": "pickup",
  "substitutePolicy": "ask",
  "contact": { "name": "Adaeze Okafor", "phone": "+234 801 234 5678", "note": "" }
}
```

`paymentMethod` is `pickup`, `transfer` or `card`. Card details are never sent by the app.
When you add a card gateway (Paystack, Flutterwave), replace the demo card fields in
`checkout.html` with the gateway's hosted field or redirect and send the resulting reference.

## Shapes

```ts
user      { id, name, email, phone, area, avatar, joined }
product   { id, name, cat, farm, price, unit, img, stock, rating, reviews, organic, tag, added, desc, ... }
farm      { id, name, area, lat, lng, rating, reviews, since, img, about, specialty: string[] }
hub       { id, name, short, area, lat, lng, day /*0=Sun*/, start /*hour*/, end /*hour*/, note }
category  { id, name, icon, blurb }
promos    { CODE: { type: 'pct' | 'flat', value, label } }
order     { id, placedAt, status, code, reviewed, hub, slot: { iso, label, window, hub },
            items: [{ id, name, price, qty, unit, img, farm }],
            subtotal, discount, promo, total, pay, substitute,
            contact: { name, phone, note },
            history: [{ stage, at }] }
notification { id, type: 'orders'|'pickup'|'offers'|'system', icon, title, text, at, read, link }
preferences  { hub, notify: { orders, pickup, offers, tips }, sms, email, substitute, theme }
```

`img` and `avatar` may be absolute URLs (CDN) or paths relative to `ASSET_BASE`.

## Rules the server must enforce

1. Harvest lock: pickup slots lock at 18:00 the day before `pickupDate` (`nextSlots` in `data.js` mirrors this). Reject orders after the lock.
2. Stock: decrement atomically on order create, restore on cancel.
3. Recalculate subtotal, discount and total from server prices. Ignore client totals.
4. Rate-limit auth and promo endpoints. Hash passwords (argon2/bcrypt), issue short-lived tokens.
5. Validate and length-limit every text field. The UI escapes output, but never trust stored HTML.
6. Set security headers (CSP allowing `unpkg.com`, `fonts.googleapis.com`, tile server, your API and image CDN).

## Suggested tables

`users`, `farms`, `hubs`, `categories`, `products`, `orders`, `order_items`, `order_events`
(history), `notifications`, `favorites`, `preferences`, `reviews`, `promo_codes`.
