/**
 * MARKETLINK CUSTOMERS — API LAYER
 * Every read/write that would touch a server goes through ML.api.
 *  - MODE 'local': resolves against the localStorage store (demo).
 *  - MODE 'api'  : calls the REST endpoints documented in docs/API.md.
 * Page scripts start with ML.onReady(fn) so the catalogue and session are
 * loaded (remote mode) before anything renders.
 */
(function (ML) {
    'use strict';
    const CFG = Object.assign({ MODE: 'local', API_BASE: '', TIMEOUT_MS: 15000, CREDENTIALS: 'include', ERROR_REPORTING: false }, window.ML_CONFIG || {});
    const remote = CFG.MODE === 'api' && !!CFG.API_BASE;
    ML.config = CFG;
    ML.remote = remote;

    /* ---------- errors ---------- */
    class ApiError extends Error {
        constructor(message, status, code, fields) { super(message); this.name = 'ApiError'; this.status = status || 0; this.code = code || 'error'; this.fields = fields || {}; }
    }
    ML.ApiError = ApiError;

    /* ---------- http ---------- */
    const TOKEN_KEY = 'token';
    const token = () => ML.store.get(TOKEN_KEY, null);
    const uuid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2));

    async function request(method, path, opts) {
        opts = opts || {};
        if (!remote) throw new ApiError('Remote API is not enabled', 0, 'local_mode');
        let url = CFG.API_BASE.replace(/\/+$/, '') + path;
        if (opts.query) { const qs = new URLSearchParams(opts.query).toString(); if (qs) url += '?' + qs; }
        const headers = { Accept: 'application/json' };
        const t = token();
        if (t) headers.Authorization = 'Bearer ' + t;
        if (opts.body !== undefined && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
        if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), CFG.TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { method, headers, credentials: CFG.CREDENTIALS, signal: ctl.signal, body: opts.body === undefined ? undefined : (opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body)) });
        } catch (e) {
            throw new ApiError(e.name === 'AbortError' ? 'The request timed out. Please try again.' : 'Cannot reach the server. Check your connection.', 0, e.name === 'AbortError' ? 'timeout' : 'network');
        } finally { clearTimeout(timer); }
        let data = null;
        if (res.status !== 204) { try { data = await res.json(); } catch (e) { data = null; } }
        if (!res.ok) {
            if (res.status === 401 && !opts.noAuthRedirect) { ML.store.remove(TOKEN_KEY); ML.store.remove('user'); }
            const err = (data && data.error) || {};
            throw new ApiError(err.message || 'Something went wrong (' + res.status + ')', res.status, err.code, err.fields);
        }
        return data;
    }
    ML.api = { request, get: (p, q) => request('GET', p, { query: q }), post: (p, b, o) => request('POST', p, Object.assign({ body: b || {} }, o)), put: (p, b) => request('PUT', p, { body: b }), patch: (p, b) => request('PATCH', p, { body: b }), del: (p) => request('DELETE', p) };
    const A = ML.api;
    const ok = (v) => Promise.resolve(v);

    /* ---------- session ---------- */
    A.auth = {
        async signIn(p) {
            if (!remote) return ML.auth.signIn(p);
            const r = await A.post('/auth/login', { email: p.email, password: p.password, remember: !!p.remember }, { noAuthRedirect: true });
            return adopt(r);
        },
        async signUp(p) {
            if (!remote) return ML.auth.signIn(p);
            const r = await A.post('/auth/register', { name: p.name, email: p.email, password: p.password, area: p.area, acceptTerms: true }, { noAuthRedirect: true });
            return adopt(r);
        },
        async forgot(email) { if (!remote) return { sent: true }; return A.post('/auth/forgot-password', { email }, { noAuthRedirect: true }); },
        async signOut() {
            try { if (remote) await A.post('/auth/logout'); } catch (e) { /* ignore, clear locally anyway */ }
            ML.store.remove(TOKEN_KEY); ML.auth.signOut();
        }
    };
    function adopt(r) {
        if (r.token) ML.store.set(TOKEN_KEY, r.token);
        ML.store.set('user', r.user);
        return r.user;
    }

    A.profile = {
        async update(patch) {
            if (!remote) return ML.auth.update(patch);
            const u = await A.patch('/me', patch);
            ML.store.set('user', u);
            return u;
        },
        async uploadAvatar(dataUrl) {
            if (!remote) return ML.auth.update({ avatar: dataUrl });
            const blob = await (await fetch(dataUrl)).blob();
            const fd = new FormData(); fd.append('avatar', blob, 'avatar.jpg');
            const r = await request('POST', '/me/avatar', { body: fd });
            return ML.auth.update({ avatar: r.avatarUrl });
        }
    };

    /* ---------- orders ---------- */
    A.orders = {
        async create(payload) {
            if (!remote) return ML.orders.create(payload);
            const body = {
                items: payload.items.map((l) => ({ productId: l.id, quantity: l.qty })),
                hubId: payload.hub, pickupDate: payload.slot.iso, promoCode: payload.promo || null,
                paymentMethod: payload.pay, substitutePolicy: payload.substitute, contact: payload.contact
            };
            const o = await A.post('/orders', body, { idempotencyKey: payload.idempotencyKey || uuid() });
            upsertOrder(o); return o;
        },
        async cancel(id) {
            if (!remote) return ML.orders.cancel(id);
            const o = await A.post('/orders/' + encodeURIComponent(id) + '/cancel'); upsertOrder(o); return o;
        },
        async review(id, review) {
            if (!remote) {
                (ML.orders.get(id).items || []).forEach((l) => ML.reviews.add(l.id, Object.assign({ name: (ML.auth.user() || {}).name }, review)));
                return ML.orders.update(id, { reviewed: true });
            }
            const o = await A.post('/orders/' + encodeURIComponent(id) + '/review', review); upsertOrder(o); return o;
        },
        async refresh() { if (!remote) return ML.orders.all(); const list = await A.get('/orders'); ML.store.set('orders', list); return list; }
    };
    function upsertOrder(o) { const l = ML.store.get('orders', []).filter((x) => x.id !== o.id); l.push(o); ML.store.set('orders', l); }

    A.reviews = {
        async create(productId, review) {
            if (!remote) return ML.reviews.add(productId, review);
            const r = await A.post('/products/' + encodeURIComponent(productId) + '/reviews', review);
            ML.reviews.add(productId, r); return r;
        }
    };
    A.promo = {
        async validate(code, subtotal) {
            if (!remote) return ML.cart.applyPromo(code) ? { code: String(code).toUpperCase(), valid: true } : { valid: false };
            return A.post('/promos/validate', { code, subtotal });
        }
    };

    /* ---------- background sync of small user state (remote only) ---------- */
    const timers = {};
    function later(key, fn) { clearTimeout(timers[key]); timers[key] = setTimeout(() => fn().catch(() => {}), 600); }
    A.fire = function (name, arg) {
        if (!remote || !ML.auth.isIn()) return;
        const enc = encodeURIComponent;
        if (name === 'notif.read') A.patch('/notifications/' + enc(arg), { read: true }).catch(() => {});
        else if (name === 'notif.unread') A.patch('/notifications/' + enc(arg), { read: false }).catch(() => {});
        else if (name === 'notif.readAll') A.post('/notifications/read-all').catch(() => {});
        else if (name === 'notif.remove') A.del('/notifications/' + enc(arg)).catch(() => {});
        else if (name === 'notif.clear') A.del('/notifications').catch(() => {});
    };
    document.addEventListener('ml:change', (e) => {
        if (!remote || !ML.auth.isIn()) return;
        const k = e.detail && e.detail.key;
        if (k === 'prefs') later('prefs', () => A.put('/me/preferences', ML.prefs.get()));
        if (k === 'favs' || k === 'favfarms') later('favs', () => A.put('/me/favorites', { products: ML.favs.list(), farms: ML.favFarms.list() }));
    });

    /* ---------- bootstrap ---------- */
    async function loadCatalog() {
        const c = await A.get('/catalog');
        ['CATEGORIES', 'FARMS', 'HUBS', 'PRODUCTS', 'PROMOS'].forEach((k) => { if (c[k.toLowerCase()]) ML[k] = c[k.toLowerCase()]; });
    }
    async function loadSession() {
        if (!token()) return;
        try {
            const b = await request('GET', '/me/bootstrap', { noAuthRedirect: true });
            ML.store.set('user', b.user);
            if (b.orders) ML.store.set('orders', b.orders);
            if (b.notifications) ML.store.set('notifs', b.notifications);
            if (b.favorites) { ML.store.set('favs', b.favorites.products || []); ML.store.set('favfarms', b.favorites.farms || []); }
            if (b.preferences) ML.store.set('prefs', b.preferences);
        } catch (e) { ML.store.remove(TOKEN_KEY); ML.store.remove('user'); }
    }
    ML.ready = remote
        ? Promise.all([loadCatalog(), loadSession()]).then(() => { ML.emit('*'); }).catch((e) => { ML.bootError = e; })
        : Promise.resolve();

    const domReady = new Promise((r) => { if (document.readyState !== 'loading') r(); else document.addEventListener('DOMContentLoaded', r); });
    ML.onReady = (fn) => Promise.all([domReady, ML.ready]).then(() => fn());

    /* ---------- client error reporting ---------- */
    if (remote && CFG.ERROR_REPORTING) {
        const send = (msg, src) => { try { A.post('/client-errors', { message: String(msg).slice(0, 500), source: src, page: location.pathname, ua: navigator.userAgent }).catch(() => {}); } catch (e) { /* ignore */ } };
        window.addEventListener('error', (e) => send(e.message, e.filename + ':' + e.lineno));
        window.addEventListener('unhandledrejection', (e) => send(e.reason && e.reason.message || e.reason, 'promise'));
    }
})(window.ML = window.ML || {});
