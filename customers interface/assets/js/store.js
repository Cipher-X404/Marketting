/**
 * MARKETLINK CUSTOMERS — STORE
 * localStorage-backed state: session, basket, favorites, orders,
 * notifications and preferences. No server yet, so every write is local.
 * Any change fires `ml:change` on document so the UI can re-render.
 */
(function (ML) {
    'use strict';

    const NS = 'ml_c_';
    const mem = {};

    const store = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(NS + key);
                if (raw == null) return fallback;
                return JSON.parse(raw);
            } catch (e) {
                return key in mem ? mem[key] : fallback;
            }
        },
        set(key, value) {
            mem[key] = value;
            try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
            ML.emit(key);
            return value;
        },
        remove(key) {
            delete mem[key];
            try { localStorage.removeItem(NS + key); } catch (e) { /* ignore */ }
            ML.emit(key);
        },
        wipe() {
            try {
                Object.keys(localStorage).filter((k) => k.indexOf(NS) === 0).forEach((k) => localStorage.removeItem(k));
            } catch (e) { /* ignore */ }
            Object.keys(mem).forEach((k) => delete mem[k]);
            ML.emit('*');
        }
    };
    ML.store = store;

    ML.emit = (key) => document.dispatchEvent(new CustomEvent('ml:change', { detail: { key } }));
    window.addEventListener('storage', (e) => { if (e.key && e.key.indexOf(NS) === 0) ML.emit(e.key.slice(NS.length)); });

    /* ============ PREFERENCES ============ */
    const PREF_DEFAULTS = {
        hub: 'yaba',
        theme: 'light',
        notify: { orders: true, pickup: true, offers: false, tips: true },
        sms: true,
        email: true,
        substitute: 'ask'
    };
    ML.prefs = {
        get() { return Object.assign({}, PREF_DEFAULTS, store.get('prefs', {}), { notify: Object.assign({}, PREF_DEFAULTS.notify, (store.get('prefs', {}) || {}).notify) }); },
        set(patch) { return store.set('prefs', Object.assign({}, store.get('prefs', {}), patch)); },
        setNotify(key, val) {
            const cur = ML.prefs.get();
            return ML.prefs.set({ notify: Object.assign({}, cur.notify, { [key]: val }) });
        }
    };

    /* ============ THEME (shared key with the farmer workspace) ============ */
    ML.theme = {
        mode() { try { return localStorage.getItem('marketlink_theme') || 'light'; } catch (e) { return 'light'; } },
        resolved() {
            const m = ML.theme.mode();
            if (m === 'system') return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            return m;
        },
        apply() { document.documentElement.setAttribute('data-theme', ML.theme.resolved()); },
        set(mode) {
            try { localStorage.setItem('marketlink_theme', mode); } catch (e) { /* ignore */ }
            ML.theme.apply();
            ML.emit('theme');
        },
        toggle() { ML.theme.set(ML.theme.resolved() === 'dark' ? 'light' : 'dark'); }
    };
    ML.theme.apply();

    /* ============ AUTH (demo: no server, profile lives on this device) ============ */
    ML.auth = {
        user() { return store.get('user', null); },
        isIn() { return !!ML.auth.user(); },
        signIn(profile) {
            const known = store.get('profiles', {});
            const key = String(profile.email || '').toLowerCase();
            const merged = Object.assign({
                name: 'Adaeze Okafor', email: key, phone: '', area: 'Yaba, Lagos', joined: new Date().toISOString(), avatar: ''
            }, known[key] || {}, stripEmpty(profile), { email: key });
            known[key] = merged;
            store.set('profiles', known);
            store.set('user', merged);
            if (!(ML.config && ML.config.MODE === 'api') && !store.get('seeded:' + key, false)) {
                seedDemo();
                store.set('seeded:' + key, true);
            }
            return merged;
        },
        update(patch) {
            const u = Object.assign({}, ML.auth.user(), patch);
            const known = store.get('profiles', {});
            known[u.email] = u;
            store.set('profiles', known);
            return store.set('user', u);
        },
        signOut() { store.remove('user'); }
    };
    function stripEmpty(o) { const r = {}; Object.keys(o).forEach((k) => { if (o[k] !== '' && o[k] != null) r[k] = o[k]; }); return r; }

    /* ============ BASKET ============ */
    ML.cart = {
        raw() { return store.get('cart', []); },
        items() {
            return ML.cart.raw().map((l) => ({ product: ML.product(l.id), qty: l.qty })).filter((l) => l.product);
        },
        count() { return ML.cart.items().reduce((n, l) => n + l.qty, 0); },
        qty(id) { const l = ML.cart.raw().find((x) => x.id === id); return l ? l.qty : 0; },
        add(id, qty) {
            const p = ML.product(id);
            if (!p) return { ok: false, reason: 'missing' };
            const cart = ML.cart.raw();
            const line = cart.find((l) => l.id === id);
            const want = (line ? line.qty : 0) + (qty || 1);
            if (want > p.stock) {
                if (line) line.qty = p.stock; else if (p.stock > 0) cart.push({ id, qty: p.stock });
                store.set('cart', cart);
                return { ok: false, reason: 'stock', max: p.stock };
            }
            if (line) line.qty = want; else cart.push({ id, qty: want });
            store.set('cart', cart);
            return { ok: true, qty: want };
        },
        setQty(id, qty) {
            const p = ML.product(id);
            let cart = ML.cart.raw();
            qty = Math.max(0, Math.min(p ? p.stock : 99, qty));
            cart = qty === 0 ? cart.filter((l) => l.id !== id) : cart.map((l) => (l.id === id ? { id, qty } : l));
            store.set('cart', cart);
        },
        remove(id) { store.set('cart', ML.cart.raw().filter((l) => l.id !== id)); },
        clear() { store.set('cart', []); },
        subtotal() { return ML.cart.items().reduce((n, l) => n + l.product.price * l.qty, 0); },
        promo() { return store.get('promo', null); },
        applyPromo(code) {
            const c = String(code || '').trim().toUpperCase();
            if (!ML.PROMOS[c]) return false;
            store.set('promo', c);
            return true;
        },
        clearPromo() { store.remove('promo'); },
        discount() {
            const c = ML.cart.promo();
            const pr = c && ML.PROMOS[c];
            if (!pr) return 0;
            const sub = ML.cart.subtotal();
            return Math.min(sub, pr.type === 'pct' ? Math.round((sub * pr.value) / 100) : pr.value);
        },
        total() { return Math.max(0, ML.cart.subtotal() - ML.cart.discount()); }
    };

    /* ============ FAVORITES ============ */
    function favApi(key) {
        return {
            list() { return store.get(key, []); },
            has(id) { return ML_has(store.get(key, []), id); },
            toggle(id) {
                const cur = store.get(key, []);
                const on = !ML_has(cur, id);
                store.set(key, on ? [id].concat(cur) : cur.filter((x) => x !== id));
                return on;
            },
            remove(id) { store.set(key, store.get(key, []).filter((x) => x !== id)); }
        };
    }
    function ML_has(arr, id) { return arr.indexOf(id) !== -1; }
    ML.favs = favApi('favs');
    ML.favFarms = favApi('favfarms');

    /* ============ ORDERS ============ */
    ML.STAGES = [
        { id: 'reserved',   label: 'Reserved',   icon: 'bx-bookmark-alt-plus', hint: 'Your basket is locked in with the farmer.' },
        { id: 'harvesting', label: 'Harvesting', icon: 'bx-sun',               hint: 'Crops are being cut for you right now.' },
        { id: 'packed',     label: 'Packed',     icon: 'bx-package',           hint: 'Packed and on its way to your hub.' },
        { id: 'ready',      label: 'Ready',      icon: 'bx-store-alt',         hint: 'Waiting at the hub. Show your pickup code.' },
        { id: 'collected',  label: 'Collected',  icon: 'bx-check-double',      hint: 'Enjoy! Thanks for buying direct.' }
    ];
    ML.orders = {
        all() { return store.get('orders', []).slice().sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)); },
        get(id) { return store.get('orders', []).find((o) => o.id === id); },
        isActive(o) { return o.status !== 'collected' && o.status !== 'cancelled'; },
        canCancel(o) { return o.status === 'reserved'; },
        create(data) {
            const orders = store.get('orders', []);
            const o = Object.assign({
                id: 'ML-' + (4000 + Math.floor(Math.random() * 5000)),
                placedAt: new Date().toISOString(),
                status: 'reserved',
                code: pickupCode(),
                reviewed: false
            }, data);
            o.history = [{ stage: 'reserved', at: o.placedAt }];
            orders.push(o);
            store.set('orders', orders);
            return o;
        },
        update(id, patch) {
            const orders = store.get('orders', []).map((o) => (o.id === id ? Object.assign({}, o, patch) : o));
            store.set('orders', orders);
            return orders.find((o) => o.id === id);
        },
        setStatus(id, status) {
            const o = ML.orders.get(id);
            if (!o) return;
            const history = (o.history || []).concat([{ stage: status, at: new Date().toISOString() }]);
            return ML.orders.update(id, { status, history });
        },
        advance(id) {
            const o = ML.orders.get(id);
            if (!o) return null;
            const idx = ML.STAGES.findIndex((s) => s.id === o.status);
            if (idx === -1 || idx >= ML.STAGES.length - 1) return o;
            return ML.orders.setStatus(id, ML.STAGES[idx + 1].id);
        },
        cancel(id) { return ML.orders.setStatus(id, 'cancelled'); },
        stageIndex(o) { return ML.STAGES.findIndex((s) => s.id === o.status); }
    };
    function pickupCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let s = '';
        for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
        return 'HV-' + s;
    }
    ML.pickupCode = pickupCode;

    /* ============ NOTIFICATIONS ============ */
    const fire = (name, arg) => { if (ML.api && ML.api.fire) ML.api.fire(name, arg); };
    ML.notifs = {
        all() { return store.get('notifs', []).slice().sort((a, b) => new Date(b.at) - new Date(a.at)); },
        unread() { return store.get('notifs', []).filter((n) => !n.read).length; },
        add(n) {
            const list = store.get('notifs', []);
            list.push(Object.assign({ id: 'n' + Date.now() + Math.floor(Math.random() * 999), at: new Date().toISOString(), read: false, type: 'system', icon: 'bx-bell' }, n));
            store.set('notifs', list);
        },
        markRead(id) { store.set('notifs', store.get('notifs', []).map((n) => (n.id === id ? Object.assign({}, n, { read: true }) : n))); fire('notif.read', id); },
        markUnread(id) { store.set('notifs', store.get('notifs', []).map((n) => (n.id === id ? Object.assign({}, n, { read: false }) : n))); fire('notif.unread', id); },
        markAll() { store.set('notifs', store.get('notifs', []).map((n) => Object.assign({}, n, { read: true }))); fire('notif.readAll'); },
        remove(id) { store.set('notifs', store.get('notifs', []).filter((n) => n.id !== id)); fire('notif.remove', id); },
        clear() { store.set('notifs', []); fire('notif.clear'); }
    };

    /* ============ REVIEWS ============ */
    ML.reviews = {
        forProduct(id) { return (store.get('reviews', {})[id] || []); },
        add(id, review) {
            const all = store.get('reviews', {});
            all[id] = [Object.assign({ at: new Date().toISOString() }, review)].concat(all[id] || []);
            store.set('reviews', all);
        }
    };

    /* ============ DEMO SEED ============ */
    function iso(daysAgo, hour) {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        if (hour != null) d.setHours(hour, 12, 0, 0);
        return d.toISOString();
    }
    function line(id, qty) {
        const p = ML.product(id);
        return { id: p.id, name: p.name, price: p.price, qty, unit: p.unit, img: p.img, farm: ML.farm(p.farm).name };
    }
    function mkOrder(id, daysAgo, items, hubId, slotOffsetDays, status, extra) {
        const hub = ML.hub(hubId);
        const d = new Date();
        d.setDate(d.getDate() + slotOffsetDays);
        const slot = {
            iso: d.getFullYear() + '-' + ML.pad(d.getMonth() + 1) + '-' + ML.pad(d.getDate()),
            label: ML.fmtDate(d), window: ML.windowLabel(hub), hub: hubId
        };
        const subtotal = items.reduce((n, l) => n + l.price * l.qty, 0);
        const stages = ML.STAGES.map((s) => s.id);
        const upto = status === 'cancelled' ? 0 : stages.indexOf(status);
        const history = stages.slice(0, upto + 1).map((s, i) => ({ stage: s, at: iso(daysAgo - Math.min(i, daysAgo), 9 + i) }));
        if (status === 'cancelled') history.push({ stage: 'cancelled', at: iso(Math.max(daysAgo - 1, 0), 15) });
        return Object.assign({
            id, placedAt: iso(daysAgo, 10), items, hub: hubId, slot, subtotal, discount: 0, total: subtotal,
            pay: 'pickup', status, code: pickupCode(), reviewed: false, history,
            contact: { name: (ML.auth.user() || {}).name || 'Customer', phone: '+234 801 234 5678', note: '' }
        }, extra || {});
    }
    function seedDemo() {
        if (store.get('orders', []).length === 0) {
            store.set('orders', [
                mkOrder('ML-4821', 1, [line('plum-tomato', 1), line('ugu-bundle', 2), line('scotch-bonnet', 1)], 'yaba', 3, 'reserved'),
                mkOrder('ML-4790', 4, [line('mango-dozen', 1), line('eggs-crate', 1)], 'ikeja', 0, 'ready'),
                mkOrder('ML-4655', 12, [line('sweet-potato', 2), line('carrots', 1)], 'yaba', -5, 'collected', { reviewed: true }),
                mkOrder('ML-4512', 20, [line('abuja-yam', 1), line('honey-beans', 1)], 'lekki', -13, 'collected'),
                mkOrder('ML-4433', 26, [line('pineapple', 3)], 'ikorodu', -19, 'cancelled')
            ]);
        }
        if (store.get('notifs', []).length === 0) {
            const N = (o) => Object.assign({ id: 'n' + Math.random().toString(36).slice(2, 8), read: false }, o);
            store.set('notifs', [
                N({ type: 'pickup', icon: 'bx-store-alt', title: 'Order ML-4790 is ready', text: 'Your mangoes and eggs are waiting at Ikeja City Mall Hub. Show code at the pickup bay.', at: iso(0, 8), link: 'orders.html?id=ML-4790' }),
                N({ type: 'orders', icon: 'bx-bookmark-alt-plus', title: 'Basket reserved: ML-4821', text: 'Green Valley and Ibe Organic have your reservation. You can still cancel until the harvest lock.', at: iso(1, 10), link: 'orders.html?id=ML-4821' }),
                N({ type: 'offers', icon: 'bx-purchase-tag-alt', title: 'Mango season is at its peak', text: 'Use code FRESH10 for 10% off your basket this week.', at: iso(2, 9), read: true, link: 'marketplace.html?cat=fruits' }),
                N({ type: 'system', icon: 'bx-leaf', title: 'Welcome to MarketLink', text: 'Reserve before the harvest lock, collect fresh at your hub. Pick a favourite hub to get started.', at: iso(3, 12), read: true, link: 'map.html' }),
                N({ type: 'orders', icon: 'bx-star', title: 'How was order ML-4512?', text: 'Rate your yam and beans to help other shoppers and reward the farmer.', at: iso(6, 17), link: 'orders.html?id=ML-4512' })
            ]);
        }
        if (store.get('favs', []).length === 0) store.set('favs', ['mango-dozen', 'scotch-bonnet', 'eggs-crate']);
    }
    ML.seedDemo = seedDemo;
    ML.resetDemo = function () {
        if (ML.config && ML.config.MODE === 'api') return;
        ['orders', 'notifs', 'favs', 'cart', 'promo', 'chat', 'reviews', 'favfarms'].forEach((k) => store.remove(k));
        seedDemo();
    };
})(window.ML);
