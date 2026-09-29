/**
 * MARKETLINK CUSTOMERS — RUNTIME CONFIG
 * Loaded first on every page. Edit this file (or generate it at deploy time)
 * to point the app at a real backend. See docs/API.md for the contract.
 *
 *   MODE 'local' : everything is stored in this browser (demo, no server).
 *   MODE 'api'   : the app talks to API_BASE and seeds no demo data.
 */
window.ML_CONFIG = {
    MODE: 'local',
    API_BASE: '',                 // e.g. 'https://api.marketlink.ng/v1'
    TIMEOUT_MS: 15000,            // per request
    CREDENTIALS: 'include',       // fetch credentials mode (cookie sessions); use 'omit' for pure bearer tokens
    ASSET_BASE: '../assets/images/', // where product/farm images live (set to a CDN URL in production)
    MAP_TILES: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    SUPPORT_EMAIL: '',            // shown by the assistant when set
    ERROR_REPORTING: false        // POST client errors to /client-errors when MODE is 'api'
};
