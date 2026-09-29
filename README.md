# Marketting
A connection between Farmers and buyers

## Structure

- `index.html`: landing page.
- `assets/`: shared by every page. `css/theme.css` (colour palette, light and dark), `css/index.css` and `js/index.js` (landing page), `videos/`, and `images/` (`products/`, `farms/`, `avatars/`, `brand/`, all locally hosted).
- `farmers interface/`: the farmer workspace (dashboard, products, orders, pickup, sales, reviews, map, chatbot, notifications, profile, settings). Page-specific CSS and JS only; the theme comes from `assets/css/theme.css`.
- `customers interface/`: the unified customer app. Pages: `auth`, `home`, `marketplace`, `product`, `favorites`, `cart`, `checkout`, `orders`, `map`, `notifications`, `chatbot`, `profile`, `settings`. Shared code lives in `assets/js/{config,data,store,api,ui,shell}.js` and `assets/css/shell.css`; each page adds its own CSS and JS.
- `docs/API.md`: the REST contract the customer app expects from a backend.
- `scripts/check.mjs`: project check (`npm run check`, runs in CI): JS syntax, broken links or assets, and remaining remote images (`--strict` fails on those).
- `scripts/localize-images.py`: swaps remote Unsplash / ui-avatars URLs for the local files in `assets/images/`.

## Running

```
npm start        # static server on http://localhost:3000
npm run check
```

## Backend

The customer app runs in **local demo mode** by default: accounts, baskets and orders live in the browser's localStorage (keys prefixed `ml_c_`).

To connect a real backend, set `MODE: 'api'` and `API_BASE` in `customers interface/assets/js/config.js` and implement the endpoints in `docs/API.md`. All network calls go through `ML.api` (`assets/js/api.js`); pages never call `fetch` directly. The server must own prices, stock, promo discounts and the harvest cut-off. Copy `.env.example` for deployment settings.
